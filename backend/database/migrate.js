require('dotenv').config();
const db = require('../src/config/database');

async function createTables() {
  const client = await db.getClient();
  
  try {
    console.log('Creating tables...');
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address TEXT,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Ensure role column exists if table was created earlier
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'customer';
        END IF;
      END
      $$;
    `);
    console.log('Created/Updated users table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created products table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        delivery_type VARCHAR(20) NOT NULL,
        payment_method VARCHAR(20) DEFAULT 'cash',
        status VARCHAR(20) DEFAULT 'pending',
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Ensure user_id and payment_method exist if table was already created
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='user_id') THEN
          ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_method') THEN
          ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cash';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='rejection_reason') THEN
          ALTER TABLE orders ADD COLUMN rejection_reason TEXT;
        END IF;
        
        -- Add ON DELETE CASCADE to user_id in orders if it's not already there
        -- This is a bit complex in pure SQL without knowing the constraint name, but we can try to drop and add.
        -- Using a simpler approach: check for foreign key and recreate it
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='orders_user_id_fkey') THEN
          ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
          ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);
    console.log('Created/Updated orders table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_at_purchase DECIMAL(10,2) NOT NULL
      )
    `);
    console.log('Created order_items table');

    await client.query('COMMIT');
    console.log('All tables created successfully');
    return true;
  } catch (error) {
    console.error('Migration error specifically:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.detail) console.error('Error detail:', error.detail);
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (client) client.release();
  }
}

if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Migration complete');
      db.pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err.message);
      process.exit(1);
    });
}

module.exports = { createTables };