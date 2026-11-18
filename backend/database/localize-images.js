require('dotenv').config();
const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'products');

const slugify = (name) => name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const localUrl = (name) => `/images/products/${slugify(name)}.jpg`;

const imgUrl = (id) => `https://images.unsplash.com/photo-${id}?q=80&w=2000&auto=format&fit=crop`;

// Verified replacement photos for products whose Unsplash URLs were deleted
const sources = {
  'Bacon Smokehouse': imgUrl('1571091718767-18b5b1457add'),
  'Smoky Bacon Deluxe': imgUrl('1596662951482-0c4ba74a6df6'),
  'Craft Strawberry Shake': imgUrl('1517701604599-bb29b565090c'),
  'Oreo Blast Shake': imgUrl('1595411425732-e69c1abe2763'),
  'BBQ Bourbon Fries': imgUrl('1525351484163-7529414344d8'),
  'Loaded Chili-Cheese Fries': imgUrl('1604908176997-125f25cc6f3d'),
  'Sweet Potato Crunch': imgUrl('1631452180519-c014fe946bc7'),
};

// New dessert products
const desserts = [
  {
    name: 'Chocolate Fudge Cake',
    description: 'Rich, moist chocolate cake layered with silky fudge and finished with glossy chocolate ganache.',
    price: 7.99,
    image_url: imgUrl('1606313564200-e75d5e30476c'),
    category: 'desserts',
    ingredients: [],
  },
  {
    name: 'Birthday Cake Slice',
    description: 'A generous slice of fluffy vanilla celebration cake with sweet buttercream and colorful sprinkles.',
    price: 6.99,
    image_url: imgUrl('1578985545062-69928b1d9587'),
    category: 'desserts',
    ingredients: [],
  },
  {
    name: 'Berry Waffle Sundae',
    description: 'Crispy waffle bowl packed with vanilla ice cream, fresh berries, chocolate drizzle and whipped cream.',
    price: 8.49,
    image_url: imgUrl('1567206563064-6f60f40a2b57'),
    category: 'desserts',
    ingredients: [],
  },
  {
    name: 'Chunky Choc Chip Cookies',
    description: 'Warm, oversized cookies loaded with molten chocolate chips — baked fresh and perfectly chewy.',
    price: 4.99,
    image_url: imgUrl('1558961363-fa8fdf82db35'),
    category: 'desserts',
    ingredients: [],
  },
];

// Desserts always download from their source URL on first run
for (const dessert of desserts) sources[dessert.name] = dessert.image_url;

async function downloadImage(url, file) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 2000) throw new Error(`Suspiciously small image: ${url}`);
  fs.writeFileSync(file, buffer);
  return buffer.length;
}

async function localizeImages() {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });

  // 1. Add dessert products (idempotent) so they get local paths from day one
  for (const dessert of desserts) {
    const name = dessert.name.trim();
    const existing = await db.query('SELECT id FROM products WHERE name = $1', [name]);
    if (existing.rows.length === 0) {
      await db.query(
        'INSERT INTO products (name, description, price, image_url, category, ingredients) VALUES ($1, $2, $3, $4, $5, $6::jsonb)',
        [name, dessert.description, dessert.price, dessert.image_url, dessert.category, JSON.stringify(dessert.ingredients)]
      );
      console.log(`  Added dessert: ${name}`);
    }
  }

  // Clean up stray leading spaces in names (safety for the data above)
  await db.query("UPDATE products SET name = TRIM(name) WHERE name <> TRIM(name)");

  // 2. Download every product image into the repo, using replacements where needed
  const result = await db.query('SELECT id, name, image_url FROM products ORDER BY id');
  const oldFiles = new Set(fs.readdirSync(IMAGE_DIR).filter(f => /^\d+\.jpg$/.test(f)));

  for (const product of result.rows) {
    const name = product.name.trim();
    const slug = slugify(name);
    const file = path.join(IMAGE_DIR, `${slug}.jpg`);
    const source = sources[name] || product.image_url;

    if (source.startsWith('/images/')) {
      // Already localized — keep the existing file
      if (!fs.existsSync(file)) throw new Error(`Missing local image for ${name}: ${file}`);
      console.log(`  OK (local): ${name}`);
    } else {
      const size = await downloadImage(source, file);
      console.log(`  Downloaded ${name}: ${(size / 1024).toFixed(0)} KB`);
    }

    await db.query('UPDATE products SET image_url = $1 WHERE id = $2', [localUrl(name), product.id]);
  }

  // 3. Remove the old id-named files
  for (const file of oldFiles) fs.unlinkSync(path.join(IMAGE_DIR, file));

  const count = await db.query('SELECT COUNT(*)::int AS n FROM products');
  const files = fs.readdirSync(IMAGE_DIR).filter(f => f.endsWith('.jpg'));
  console.log(`Done. ${count.rows[0].n} products, ${files.length} local images.`);
}

if (require.main === module) {
  localizeImages()
    .then(() => { db.pool.end(); })
    .catch((e) => { console.error('Error:', e.message); db.pool.end(); process.exitCode = 1; });
}

module.exports = { localizeImages, localUrl, slugify };
