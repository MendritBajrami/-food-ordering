const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

const seedProducts = [
  // BURGERS
  { 
    name: 'The Signature King', 
    description: 'A 4K-quality masterpiece: double flame-grilled beef, melted aged cheddar, tempura onion rings, and our truffle-infused secret sauce on a toasted brioche bun.', 
    price: 14.99, 
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2000&auto=format&fit=crop', 
    category: 'burgers' 
  },
  { 
    name: 'Dirty Louisiana', 
    description: 'A Southern classic with a spicy kick! Crispy fried chicken breast, spicy mayo, pickles, lettuce, and our house-made Cajun hot sauce.', 
    price: 13.99, 
    image_url: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=2000&auto=format&fit=crop', 
    category: 'burgers' 
  },
  { 
    name: 'Bacon Smokehouse', 
    description: 'Crispy thick-cut maple bacon, grilled onions, sharp cheddar, and smoky hickory BBQ sauce over a juicy half-pound patty.', 
    price: 12.99, 
    image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a572eca17?q=80&w=2000&auto=format&fit=crop', 
    category: 'burgers' 
  },
  { 
    name: 'Truffle & Swiss', 
    description: 'Earthy black truffle mayo, sauteed forest mushrooms, and melted Swiss cheese on a premium Wagyu beef patty.', 
    price: 13.49, 
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000&auto=format&fit=crop', 
    category: 'burgers' 
  },
  // FRIES
  { 
    name: 'Classic Golden Fries', 
    description: 'Twice-fried Belgian style potatoes, perfectly salted with sea salt and served with a side of roasted garlic aioli.', 
    price: 4.99, 
    image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=2000&auto=format&fit=crop', 
    category: 'fries' 
  },
  { 
    name: 'BBQ Bourbon Fries', 
    description: 'Crispy fries tossed in our signature BBQ-Bourbon seasoning, topped with pulled pork and pickled red onions.', 
    price: 8.99, 
    image_url: 'https://images.unsplash.com/photo-1585109649139-366fea07a66c?q=80&w=2000&auto=format&fit=crop', 
    category: 'fries' 
  },
  { 
    name: 'Loaded Chili-Cheese Fries', 
    description: 'Golden fries smothered in slow-cooked beef chili, sharp cheddar sauce, jalapeños, and whipped sour cream.', 
    price: 7.99, 
    image_url: 'https://images.unsplash.com/photo-1585109649139-366fea07a66c?q=80&w=2000&auto=format&fit=crop', 
    category: 'fries' 
  },
  { 
    name: 'Sweet Potato Crunch', 
    description: 'Premium sweet potato fries dusted with cinnamon sugar and salt, served with a chipotle honey dip.', 
    price: 6.49, 
    image_url: 'https://images.unsplash.com/photo-1572490128847-f0e92c2c4071?q=80&w=2000&auto=format&fit=crop', 
    category: 'fries' 
  },
  // DRINKS
  { 
    name: 'Craft Strawberry Shake', 
    description: 'Hand-spun premium strawberry ice cream, topped with fresh berry coulis, whipped cream, and a maraschino cherry.', 
    price: 6.99, 
    image_url: 'https://images.unsplash.com/photo-1579954115545-a95591f28be0?q=80&w=2000&auto=format&fit=crop', 
    category: 'drinks' 
  },
  { 
    name: 'Sparkling Lemon & Mint', 
    description: 'House-made sparkling lemonade infused with fresh garden mint and Sicilian lemon zest.', 
    price: 4.49, 
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=2000&auto=format&fit=crop', 
    category: 'drinks' 
  },
  { 
    name: 'Oreo Blast Shake', 
    description: 'Rich vanilla bean ice cream blended with real Oreo chunks, chocolate ganache, and topped with a whole cookie.', 
    price: 7.49, 
    image_url: 'https://images.unsplash.com/photo-1572490128847-f0e92c2c4071?q=80&w=2000&auto=format&fit=crop', 
    category: 'drinks' 
  },
  // COMBOS
  { 
    name: 'The Ultimate Combo', 
    description: 'Any signature burger, a large side of loaded fries, and a premium craft shake of your choice.', 
    price: 24.99, 
    image_url: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=2000&auto=format&fit=crop', 
    category: 'combos' 
  },
  { 
    name: 'Family Feast', 
    description: '4 Signature King burgers, 2 large fries, 2 sweet potato fries, and 4 drinks of your choice.', 
    price: 49.99, 
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop', 
    category: 'combos' 
  }
];

async function seedDatabase() {
  try {
    console.log('Clearing existing data...');
    await db.query('DELETE FROM order_items');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM users');

    console.log('Seeding products...');
    for (const product of seedProducts) {
      await db.query(
        'INSERT INTO products (name, description, price, image_url, category) VALUES ($1, $2, $3, $4, $5)',
        [product.name, product.description, product.price, product.image_url, product.category]
      );
    }
    console.log('Products seeded: ' + seedProducts.length);

    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.query(
      'INSERT INTO users (name, phone, password_hash, address, role) VALUES ($1, $2, $3, $4, $5)',
      ['Admin', '1234567890', adminPassword, '123 Restaurant Street', 'admin']
    );
    console.log('Admin created');

    console.log('Seed complete');
  } catch (error) {
    console.error('Seed error:', error.message);
    throw error;
  } finally {
    db.pool.end();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));