import { MenuItem, type MenuItemDoc } from "../models/MenuItem.js";

export const seedMenuItemData: MenuItemDoc[] = [
  // Appetizers
  { name: "Loaded Potato Skins", description: "Crispy potato skins with cheddar, bacon, and sour cream", priceCents: 950, category: "Appetizers" },
  { name: "Buffalo Cauliflower", description: "Crispy cauliflower tossed in buffalo sauce, served with ranch", priceCents: 900, category: "Appetizers" },
  { name: "Fried Pickles", description: "Beer-battered dill pickle chips with chipotle mayo", priceCents: 750, category: "Appetizers" },
  { name: "Spinach Artichoke Dip", description: "Warm dip with tortilla chips", priceCents: 850, category: "Appetizers" },
  { name: "Mozzarella Sticks", description: "Six hand-breaded sticks with marinara", priceCents: 800, category: "Appetizers" },

  // Mains
  { name: "Classic Cheeseburger", description: "Half-pound patty, cheddar, lettuce, tomato, brioche bun", priceCents: 1400, category: "Mains" },
  { name: "BBQ Bacon Burger", description: "Beef patty, bacon, cheddar, onion straws, BBQ sauce", priceCents: 1550, category: "Mains" },
  { name: "Grilled Chicken Sandwich", description: "Marinated chicken breast, lettuce, tomato, garlic aioli", priceCents: 1300, category: "Mains" },
  { name: "Fish and Chips", description: "Beer-battered cod with fries and tartar sauce", priceCents: 1600, category: "Mains" },
  { name: "Southwest Cobb Salad", description: "Grilled chicken, black beans, corn, avocado, chipotle ranch", priceCents: 1350, category: "Mains" },
  { name: "Veggie Burger", description: "House-made black bean patty, lettuce, tomato, chipotle mayo", priceCents: 1300, category: "Mains" },
  { name: "BBQ Pulled Pork Sandwich", description: "Slow-cooked pork, house BBQ sauce, coleslaw, brioche bun", priceCents: 1450, category: "Mains" },

  // Drinks
  { name: "Fountain Soda", description: "Coke, Diet Coke, Sprite, or root beer", priceCents: 350, category: "Drinks" },
  { name: "Iced Tea", description: "Sweet or unsweetened, freshly brewed", priceCents: 350, category: "Drinks" },
  { name: "Fresh Lemonade", description: "House-made, lightly sweetened", priceCents: 400, category: "Drinks" },
  { name: "Craft Root Beer", description: "Local small-batch root beer", priceCents: 450, category: "Drinks" },

  // Desserts
  { name: "Chocolate Lava Cake", description: "Warm chocolate cake with a molten center, vanilla ice cream", priceCents: 750, category: "Desserts" },
  { name: "New York Cheesecake", description: "Classic cheesecake with a graham cracker crust", priceCents: 700, category: "Desserts" },
  { name: "Apple Crumble", description: "Warm spiced apples with an oat crumble topping, vanilla ice cream", priceCents: 700, category: "Desserts" },
];

export async function seedMenuItems(): Promise<void> {
  await MenuItem.deleteMany({});
  await MenuItem.insertMany(seedMenuItemData);
}
