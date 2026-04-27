const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

const seedProducts = [
  { name: 'Classic Burger', description: 'Juicy beef patty with fresh lettuce, tomato, and our special sauce', price: 8.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'burgers' },
  { name: 'Cheese Burger', description: 'Classic burger topped with melted cheddar cheese', price: 9.99, image_url: 'https://images.unsplash.com/photo-1553979459-d22231ba6150?w=400', category: 'burgers' },
  { name: 'Double Patty Burger', description: 'Two beef patties with bacon, cheese, and all the fixings', price: 12.99, image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a572eca17?w=400', category: 'burgers' },
  { name: 'Bacon Burger', description: 'Classic burger with crispy bacon strips', price: 10.99, image_url: 'https://images.unsplash.com/photo-1572802419224-296b0a9a81f2?w=400', category: 'burgers' },
  { name: 'Crispy Fries', description: 'Golden, crispy, and perfectly salted', price: 3.99, image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400', category: 'fries' },
  { name: 'Loaded Fries', description: 'Fries topped with cheese, bacon, and sour cream', price: 5.99, image_url: 'https://images.unsplash.com/photo-1585109649139-366fea07a66c?w=400', category: 'fries' },
  { name: 'Onion Rings', description: 'Crispy battered onion rings', price: 4.99, image_url: 'https://images.unsplash.com/photo-1639024471283-1d01b50e1d15?w=400', category: 'fries' },
  { name: 'Curly Fries', description: 'Spiral-cut crispy fries with seasoning', price: 4.49, image_url: 'https://images.unsplash.com/photo-1572490128847-f0e92c2c4071?w=400', category: 'fries' },
  { name: 'Cola', description: 'Classic refreshing cola drink', price: 2.49, image_url: 'https://images.unsplash.com/photo-1629203851122-3724ec5812fe?w=400', category: 'drinks' },
  { name: 'Lemonade', description: 'Fresh squeezed lemonade', price: 2.99, image_url: 'https://images.unsplash.com/photo-1621263764928-df7884f7d8e3?w=400', category: 'drinks' },
  { name: 'Milkshake', description: 'Creamy vanilla milkshake', price: 4.99, image_url: 'https://images.unsplash.com/photo-1572490128847-f0e92c2c4071?w=400', category: 'drinks' },
  { name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 3.49, image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240487?w=400', category: 'drinks' },
  { name: 'Burger Combo', description: 'Classic burger with medium fries and medium drink', price: 14.99, image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a572eca17?w=400', category: 'combos' },
  { name: 'Family Pack', description: '4 burgers, 2 large fries, 4 drinks', price: 29.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'combos' },
  { name: 'Kids Meal', description: 'Small burger, small fries, juice box', price: 8.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'combos' }
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