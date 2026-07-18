export interface MenuItemDTO {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
}

export interface RewardDTO {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountAmountCents: number;
}
