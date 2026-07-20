import { Order } from "../models/Order.js";
import { LoyaltyEvent } from "../models/LoyaltyEvent.js";

const PAGE_SIZE = 20;

export interface CustomerRow {
  name: string;
  phone: string;
  pointsBalance: number;
  lifetimeOrders: number;
  lastOrderAt: Date;
}

export interface CustomerListResult {
  customers: CustomerRow[];
  page: number;
  totalPages: number;
}

interface CustomerListOptions {
  search?: string;
  page?: number;
}

export async function getCustomerList(options: CustomerListOptions): Promise<CustomerListResult> {
  const page = options.page ?? 1;

  const [grouped, balances] = await Promise.all([
    Order.aggregate<{ _id: string; lifetimeOrders: number; lastOrderAt: Date; names: (string | null)[] }>([
      { $match: { status: "paid" } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$phone",
          lifetimeOrders: { $sum: 1 },
          lastOrderAt: { $max: "$createdAt" },
          names: { $push: "$customerName" },
        },
      },
    ]),
    LoyaltyEvent.aggregate<{ _id: string; total: number }>([
      { $group: { _id: "$phone", total: { $sum: "$points" } } },
    ]),
  ]);

  const balanceByPhone = new Map(balances.map((b) => [b._id, b.total]));

  let customers: CustomerRow[] = grouped.map((g) => ({
    name: g.names.find((name) => name) ?? "Guest",
    phone: g._id,
    pointsBalance: balanceByPhone.get(g._id) ?? 0,
    lifetimeOrders: g.lifetimeOrders,
    lastOrderAt: g.lastOrderAt,
  }));

  customers.sort((a, b) => b.lastOrderAt.getTime() - a.lastOrderAt.getTime());

  if (options.search) {
    const query = options.search.toLowerCase();
    customers = customers.filter(
      (c) => c.name.toLowerCase().includes(query) || c.phone.toLowerCase().includes(query),
    );
  }

  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageCustomers = customers.slice(start, start + PAGE_SIZE);

  return { customers: pageCustomers, page, totalPages };
}
