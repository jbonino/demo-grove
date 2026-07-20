import { MenuItem, type MenuItemDoc } from "../models/MenuItem.js";

export const seedMenuItemData: MenuItemDoc[] = [
  // Starters
  { name: "Seared Sea Scallops", description: "Pan-seared diver scallops, English pea purée, crispy prosciutto", priceCents: 1800, category: "Starters", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Scallops_at_Capital_Grille.jpg/500px-Scallops_at_Capital_Grille.jpg" },
  { name: "Tuna Tartare", description: "Ahi tuna, avocado, sesame-soy vinaigrette, wonton crisps", priceCents: 1900, category: "Starters", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/TunaTartare.jpg/500px-TunaTartare.jpg" },

  // Entrées
  { name: "Braised Short Rib", description: "Red wine braised short rib, parmesan polenta, root vegetables", priceCents: 3400, category: "Entrées", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Slow_Braised_Short_Rib_NYC.jpg/500px-Slow_Braised_Short_Rib_NYC.jpg" },
  { name: "Pan-Seared Duck Breast", description: "Cherry gastrique, roasted fingerling potatoes, charred broccolini", priceCents: 3600, category: "Entrées", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Cooked_duck_breast.jpg/500px-Cooked_duck_breast.jpg" },
  { name: "Herb-Crusted Rack of Lamb", description: "Dijon-herb crust, rosemary jus, garlic whipped potatoes", priceCents: 4200, category: "Entrées", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pine_nut_%26_Rosemary_crusted_rack_of_lamb_%283542533355%29.jpg/500px-Pine_nut_%26_Rosemary_crusted_rack_of_lamb_%283542533355%29.jpg" },
  { name: "Miso-Glazed Salmon", description: "Wild salmon, jasmine rice, charred bok choy, ginger-scallion oil", priceCents: 3200, category: "Entrées", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Grilled_plated_salmon_fillet.jpg/500px-Grilled_plated_salmon_fillet.jpg" },
  { name: "Roasted Chicken Supreme", description: "Free-range chicken breast, wild mushroom risotto, sage jus", priceCents: 2800, category: "Entrées", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Roasted_Chicken_Breast_%2832868373128%29.jpg/500px-Roasted_Chicken_Breast_%2832868373128%29.jpg" },
  { name: "Wild Mushroom Risotto", description: "Arborio rice, wild mushroom medley, parmesan, white truffle oil", priceCents: 2600, category: "Entrées", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/%EB%BD%81%EC%8B%9D%EB%8B%B9_%EB%A8%B8%EC%89%AC%EB%A3%B8_%ED%81%AC%EB%A6%BC_%EB%A6%AC%EC%A1%B0%EB%98%90_3.jpg/500px-%EB%BD%81%EC%8B%9D%EB%8B%B9_%EB%A8%B8%EC%89%AC%EB%A3%B8_%ED%81%AC%EB%A6%BC_%EB%A6%AC%EC%A1%B0%EB%98%90_3.jpg" },
  { name: "Dry-Aged Ribeye", description: "14oz dry-aged ribeye, bordelaise sauce, roasted marrow bone", priceCents: 4800, category: "Entrées", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Longhorn_Steakhouse_Ribeye_steak.jpg/500px-Longhorn_Steakhouse_Ribeye_steak.jpg" },

  // Sides
  { name: "Truffle Parmesan Fries", description: "Hand-cut fries, black truffle, shaved parmesan", priceCents: 900, category: "Sides", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Truffle_fries_with_parmesan%2C_aioli%2C_hot_sauce_%2821153782574%29.jpg/500px-Truffle_fries_with_parmesan%2C_aioli%2C_hot_sauce_%2821153782574%29.jpg" },
  { name: "Garlic Whipped Potatoes", description: "Yukon gold potatoes, roasted garlic, crème fraîche", priceCents: 750, category: "Sides", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/2019-11-28_14_29_27_A_bowl_of_mashed_potatoes_laid_out_for_Thanksgiving_Dinner_in_the_Parkway_Village_section_of_Ewing_Township%2C_Mercer_County%2C_New_Jersey.jpg/500px-2019-11-28_14_29_27_A_bowl_of_mashed_potatoes_laid_out_for_Thanksgiving_Dinner_in_the_Parkway_Village_section_of_Ewing_Township%2C_Mercer_County%2C_New_Jersey.jpg" },
  { name: "Grilled Asparagus", description: "Lemon zest, shaved parmesan, extra virgin olive oil", priceCents: 800, category: "Sides", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Grilled_asparagus%2C_prosciutto%2C_63-degree_egg_and_torn_croutons.jpg/500px-Grilled_asparagus%2C_prosciutto%2C_63-degree_egg_and_torn_croutons.jpg" },

  // Desserts
  { name: "Chocolate Lava Cake", description: "Warm dark chocolate cake, molten center, vanilla bean ice cream", priceCents: 1200, category: "Desserts", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Soufle_Di_Cioccolato.jpg/500px-Soufle_Di_Cioccolato.jpg" },
  { name: "Crème Brûlée", description: "Madagascar vanilla custard, caramelized sugar crust", priceCents: 1100, category: "Desserts", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Dessert_Creme_Brulee.jpg/500px-Dessert_Creme_Brulee.jpg" },
  { name: "Deconstructed Tiramisu", description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust", priceCents: 1150, category: "Desserts", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Dessert_Tiramisu.jpg/500px-Dessert_Tiramisu.jpg" },
];

export async function seedMenuItems(): Promise<void> {
  await MenuItem.deleteMany({});
  await MenuItem.insertMany(seedMenuItemData);
}
