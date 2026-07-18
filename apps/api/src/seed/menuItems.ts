import { MenuItem, type MenuItemDoc } from "../models/MenuItem.js";

export const seedMenuItemData: MenuItemDoc[] = [
  // Starters
  { name: "Seared Sea Scallops", description: "Pan-seared diver scallops, English pea purée, crispy prosciutto", priceCents: 1800, category: "Starters" },
  { name: "Burrata & Heirloom Tomato", description: "Fresh burrata, heirloom tomatoes, basil oil, aged balsamic", priceCents: 1600, category: "Starters" },
  { name: "Tuna Tartare", description: "Ahi tuna, avocado, sesame-soy vinaigrette, wonton crisps", priceCents: 1900, category: "Starters" },
  { name: "Roasted Bone Marrow", description: "Herb gremolata, grilled sourdough, sea salt", priceCents: 1700, category: "Starters" },
  { name: "Wild Mushroom Soup", description: "Roasted wild mushrooms, truffle oil, crème fraîche", priceCents: 1200, category: "Starters" },

  // Entrées
  { name: "Braised Short Rib", description: "Red wine braised short rib, parmesan polenta, root vegetables", priceCents: 3400, category: "Entrées" },
  { name: "Pan-Seared Duck Breast", description: "Cherry gastrique, roasted fingerling potatoes, charred broccolini", priceCents: 3600, category: "Entrées" },
  { name: "Herb-Crusted Rack of Lamb", description: "Dijon-herb crust, rosemary jus, garlic whipped potatoes", priceCents: 4200, category: "Entrées" },
  { name: "Miso-Glazed Salmon", description: "Wild salmon, jasmine rice, charred bok choy, ginger-scallion oil", priceCents: 3200, category: "Entrées" },
  { name: "Roasted Chicken Supreme", description: "Free-range chicken breast, wild mushroom risotto, sage jus", priceCents: 2800, category: "Entrées" },
  { name: "Wild Mushroom Risotto", description: "Arborio rice, wild mushroom medley, parmesan, white truffle oil", priceCents: 2600, category: "Entrées" },
  { name: "Dry-Aged Ribeye", description: "14oz dry-aged ribeye, bordelaise sauce, roasted marrow bone", priceCents: 4800, category: "Entrées" },

  // Sides
  { name: "Truffle Parmesan Fries", description: "Hand-cut fries, black truffle, shaved parmesan", priceCents: 900, category: "Sides" },
  { name: "Charred Brussels Sprouts", description: "Brown butter, toasted hazelnuts, aged balsamic", priceCents: 850, category: "Sides" },
  { name: "Garlic Whipped Potatoes", description: "Yukon gold potatoes, roasted garlic, crème fraîche", priceCents: 750, category: "Sides" },
  { name: "Grilled Asparagus", description: "Lemon zest, shaved parmesan, extra virgin olive oil", priceCents: 800, category: "Sides" },

  // Desserts
  { name: "Chocolate Lava Cake", description: "Warm dark chocolate cake, molten center, vanilla bean ice cream", priceCents: 1200, category: "Desserts" },
  { name: "Crème Brûlée", description: "Madagascar vanilla custard, caramelized sugar crust", priceCents: 1100, category: "Desserts" },
  { name: "Deconstructed Tiramisu", description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust", priceCents: 1150, category: "Desserts" },
];

export async function seedMenuItems(): Promise<void> {
  await MenuItem.deleteMany({});
  await MenuItem.insertMany(seedMenuItemData);
}
