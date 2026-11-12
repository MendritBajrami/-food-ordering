require('dotenv').config();
const db = require('../src/config/database');

// Customizable ingredient lists for the EXISTING burgers (add-on feature)
const existingBurgerIngredients = {
  'The Signature King': ['Double beef patty', 'Aged cheddar', 'Onion rings', 'Truffle mayo', 'Lettuce', 'Tomato', 'Pickles', 'Brioche bun'],
  'Dirty Louisiana': ['Fried chicken', 'Cajun hot sauce', 'Spicy mayo', 'Pickles', 'Lettuce', 'Brioche bun'],
  'Bacon Smokehouse': ['Beef patty', 'Maple bacon', 'Grilled onions', 'Cheddar', 'Hickory BBQ sauce', 'Lettuce', 'Tomato'],
  'Truffle & Swiss': ['Wagyu beef patty', 'Swiss cheese', 'Sauteed mushrooms', 'Truffle mayo', 'Arugula', 'Brioche bun'],
};

const imgUrl = (id) => `https://images.unsplash.com/photo-${id}?q=80&w=2000&auto=format&fit=crop`;

// 4 NEW products per category
const newProducts = [
  // BURGERS
  {
    name: 'Smoky Bacon Deluxe',
    description: 'Flame-grilled beef patty stacked with crispy bacon, melted cheddar, caramelized onions and creamy smokehouse sauce on a toasted sesame bun.',
    price: 13.99,
    image_url: imgUrl('1598887142487-d3f4ab4fd181'),
    category: 'burgers',
    ingredients: ['Beef patty', 'Bacon', 'Cheddar', 'Caramelized onions', 'Smokehouse sauce', 'Lettuce', 'Tomato', 'Pickles', 'Sesame bun'],
  },
  {
    name: 'Double Smash Stack',
    description: 'Two crispy-edged smashed beef patties drowned in molten cheddar sauce with tangy pickles and grilled onions on a soft potato bun.',
    price: 12.49,
    image_url: imgUrl('1607013251379-e6eecfffe234'),
    category: 'burgers',
    ingredients: ['2 smashed beef patties', 'Cheddar sauce', 'Pickles', 'Grilled onions', 'Mustard', 'Potato bun'],
  },
  {
    name: 'Crispy Chicken Ranch',
    description: 'Golden buttermilk-fried chicken breast, cool ranch drizzle, crunchy coleslaw and pickles on a pillowy brioche bun.',
    price: 12.99,
    image_url: imgUrl('1606755962773-d324e0a13086'),
    category: 'burgers',
    ingredients: ['Fried chicken breast', 'Ranch sauce', 'Coleslaw', 'Pickles', 'Lettuce', 'Brioche bun'],
  },
  {
    name: 'Garden Veggie',
    description: 'A hearty plant-based patty layered with creamy avocado slices, fresh tomato, peppery arugula and vegan garlic mayo on a multigrain bun.',
    price: 10.99,
    image_url: imgUrl('1520072959219-c595dc870360'),
    category: 'burgers',
    ingredients: ['Plant-based patty', 'Avocado', 'Tomato', 'Arugula', 'Red onion', 'Vegan garlic mayo', 'Multigrain bun'],
  },
  // FRIES
  {
    name: 'Cajun Spice Fries',
    description: 'Crispy golden fries dusted in bold Cajun spice blend with a smoky kick — served hot from the fryer.',
    price: 5.49,
    image_url: imgUrl('1541592106381-b31e9677c0e5'),
    category: 'fries',
    ingredients: [],
  },
  {
    name: 'Golden Ketchup Fries',
    description: 'Classic hand-cut fries, twice-fried for maximum crunch, with a side of rich tomato ketchup.',
    price: 4.49,
    image_url: imgUrl('1518013431117-eb1465fa5752'),
    category: 'fries',
    ingredients: [],
  },
  {
    name: 'Sweet Potato Fries & Dip',
    description: 'Oven-crisped sweet potato fries with a cool, creamy house dip — sweet, salty and irresistible.',
    price: 6.49,
    image_url: imgUrl('1598679253544-2c97992403ea'),
    category: 'fries',
    ingredients: [],
  },
  {
    name: 'Rustic Steak Fries',
    description: 'Thick-cut skin-on steak fries, fried until golden and finished with flaky sea salt on a wooden board.',
    price: 5.99,
    image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=800&h=800&auto=format&fit=crop&crop=left',
    category: 'fries',
    ingredients: [],
  },
  // DRINKS
  {
    name: 'Strawberry Smoothie',
    description: 'Fresh strawberries blended with yogurt and a touch of honey, topped with chia seeds and mint.',
    price: 5.99,
    image_url: imgUrl('1502741224143-90386d7f8c82'),
    category: 'drinks',
    ingredients: [],
  },
  {
    name: 'Mint Lemonade Cooler',
    description: 'House-made lemonade with sliced lemon, lime and crushed garden mint over crushed ice.',
    price: 4.49,
    image_url: imgUrl('1621263764928-df1444c5e859'),
    category: 'drinks',
    ingredients: [],
  },
  {
    name: 'Iced Caramel Coffee',
    description: 'Double-shot espresso over ice, swirled with silky caramel cream.',
    price: 4.99,
    image_url: imgUrl('1461023058943-07fcbe16d735'),
    category: 'drinks',
    ingredients: [],
  },
  {
    name: 'Very Berry Milkshake',
    description: 'Creamy vanilla shake blended with raspberries and blueberries, crowned with fresh berries.',
    price: 6.49,
    image_url: imgUrl('1600718374662-0483d2b9da44'),
    category: 'drinks',
    ingredients: [],
  },
  // COMBOS
  {
    name: 'Boardwalk Combo',
    description: 'A juicy cheeseburger with all the fixings plus a mountain of golden steak fries on a rustic board.',
    price: 17.99,
    image_url: imgUrl('1561758033-d89a9ad46330'),
    category: 'combos',
    ingredients: [],
  },
  {
    name: 'Classic Duo Combo',
    description: 'Grilled chicken burger served with a pile of crispy fries, olives and fresh tomato slices.',
    price: 15.99,
    image_url: imgUrl('1512152272829-e3139592d56f'),
    category: 'combos',
    ingredients: [],
  },
  {
    name: 'Gourmet Combo Meal',
    description: 'The gourmet burger, a cup of hot fries and a thick pink milkshake — the full restaurant experience.',
    price: 19.99,
    image_url: imgUrl('1610440042657-612c34d95e9f'),
    category: 'combos',
    ingredients: [],
  },
  {
    name: 'Chicken Feast Basket',
    description: 'A generous platter of hand-breaded crispy chicken tenders with our signature house dip. Perfect for sharing.',
    price: 16.99,
    image_url: imgUrl('1562967914-608f82629710'),
    category: 'combos',
    ingredients: [],
  },
];

(async () => {
  try {
    console.log('Updating existing burgers with customizable ingredients...');
    for (const [name, ingredients] of Object.entries(existingBurgerIngredients)) {
      const r = await db.query('UPDATE products SET ingredients = $1::jsonb WHERE name = $2', [
        JSON.stringify(ingredients), name,
      ]);
      console.log(`  ${name}: ${r.rowCount} row(s) updated`);
    }

    console.log('Adding new products...');
    for (const p of newProducts) {
      const exists = await db.query('SELECT id FROM products WHERE name = $1', [p.name]);
      if (exists.rows.length > 0) {
        console.log(`  SKIP (exists): ${p.name}`);
        continue;
      }
      await db.query(
        'INSERT INTO products (name, description, price, image_url, category, ingredients) VALUES ($1, $2, $3, $4, $5, $6::jsonb)',
        [p.name, p.description, p.price, p.image_url, p.category, JSON.stringify(p.ingredients)]
      );
      console.log(`  Added: ${p.name} ($${p.price.toFixed(2)}, ${p.category})`);
    }

    const count = await db.query('SELECT COUNT(*)::int AS n FROM products');
    console.log(`Total products in DB: ${count.rows[0].n}`);
    console.log('Done');
  } catch (e) {
    console.error('Error:', e.message);
    process.exitCode = 1;
  } finally {
    db.pool.end();
  }
})();
