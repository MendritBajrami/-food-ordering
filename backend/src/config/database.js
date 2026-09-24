const { Pool } = require('pg');

// Determine SSL config based on environment or URL
const isNeon = process.env.DATABASE_URL?.includes('neon.tech') || process.env.DB_HOST?.includes('neon.tech');

const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Neon SSL connection
      },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'food_ordering',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: isNeon || process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30000,       // Keep connections open longer to avoid frequent reconnects
  connectionTimeoutMillis: 15000, // 15s timeout allows Neon time to wake up from cold start
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};