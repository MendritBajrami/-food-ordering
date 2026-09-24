# Food Ordering SaaS - Technical Roadmap

## Overview
Production-ready full-stack food ordering platform for fast food restaurants with real-time admin dashboard.

**Tech Stack:** Next.js (React) + Tailwind CSS | Express.js | PostgreSQL | Socket.io | JWT

---

## Phase 1: Project Foundation

### Step 1.1 - Initialize Monorepo Structure
```
project-root/
├── frontend/          # Next.js app
├── backend/           # Express.js API
├── database/          # SQL migrations & seed data
└── docs/              # Architecture docs
```

### Step 1.2 - Frontend Setup
- [ ] Initialize Next.js 14 with App Router
- [ ] Install dependencies: Tailwind CSS, Socket.io-client, React Icons
- [ ] Configure Tailwind with custom color palette
- [ ] Set up folder structure: `/app`, `/components`, `/lib`, `/hooks`, `/types`

### Step 1.3 - Backend Setup
- [ ] Initialize Node.js project with Express
- [ ] Install dependencies: pg, socket.io, jsonwebtoken, bcrypt, cors, dotenv
- [ ] Set up folder structure: `/routes`, `/controllers`, `/models`, `/middleware`
- [ ] Create database connection pool

### Step 1.4 - Database Setup
- [ ] Create PostgreSQL database
- [ ] Create migration files for all tables
- [ ] Seed initial product data with Unsplash food images

---

## Phase 2: Database Schema

### Step 2.1 - Create Tables
- [ ] **users** - id, name, phone, password_hash, address, role, created_at
- [ ] **products** - id, name, description, price, image_url, category, is_available, created_at
- [ ] **orders** - id, customer_name, phone, address, delivery_type, status, total_price, created_at
- [ ] **order_items** - id, order_id, product_id, quantity, price_at_purchase

### Step 2.2 - Seed Data
- [ ] Create 15+ realistic food items across categories (Burgers, Fries, Drinks, Combos)
- [ ] Use high-quality Unsplash food images
- [ ] Set realistic prices ($3.99 - $15.99 range)

---

## Phase 3: Backend API

### Step 3.1 - Authentication Routes
- [ ] POST `/api/auth/register` - Create customer/admin account
- [ ] POST `/api/auth/login` - JWT login, return token
- [ ] GET `/api/auth/me` - Verify token, return user

### Step 3.2 - Product Routes
- [ ] GET `/api/products` - List all products (with category filter)
- [ ] GET `/api/products/:id` - Single product details
- [ ] POST `/api/products` - Create product (admin only)
- [ ] PUT `/api/products/:id` - Update product (admin only)

### Step 3.3 - Order Routes
- [ ] POST `/api/orders` - Create new order
- [ ] GET `/api/orders` - List orders (admin only)
- [ ] GET `/api/orders/:id` - Order details (admin only)
- [ ] PATCH `/api/orders/:id/status` - Update order status (admin only)

### Step 3.4 - Socket.io Integration
- [ ] Set up WebSocket server on same port as Express
- [ ] Emit `new-order` event when order created
- [ ] Emit `order-updated` event when status changes

---

## Phase 4: Frontend - Core Components

### Step 4.1 - Layout Components
- [ ] **Navbar** - Logo, menu links, cart icon with badge count
- [ ] **Footer** - Restaurant info, hours, contact
- [ ] **CartDrawer** - Slide-in drawer with items, quantity controls, total

### Step 4.2 - Shared Components
- [ ] **ProductCard** - Image, name, price, add-to-cart button with hover effect
- [ ] **CategoryFilter** - Horizontal pill buttons for filtering
- [ ] **SearchBar** - Search input with debounced filtering
- [ ] **Button** - Primary/secondary variants with transitions
- [ ] **Input** - Form input with label and validation states
- [ ] **Badge** - Status badges with color coding

### Step 4.3 - Context Providers
- [ ] **CartContext** - Cart state management, add/remove/update items, persistence to localStorage
- [ ] **AuthContext** - User authentication state

---

## Phase 5: Frontend - Pages

### Step 5.1 - Menu Page (Home)
- [ ] Hero section with restaurant branding
- [ ] Search bar at top
- [ ] Category filter tabs
- [ ] Product grid (responsive: 1 col mobile, 2 col tablet, 3-4 col desktop)
- [ ] Each product card shows: image, name, price, add button

### Step 5.2 - Cart Page
- [ ] List of cart items with quantity controls (+/-)
- [ ] Remove item button
- [ ] Subtotal per item
- [ ] Order total calculation
- [ ] "Proceed to Checkout" button

### Step 5.3 - Checkout Page
- [ ] Form fields: Full name, Phone, Address
- [ ] Delivery type toggle: Delivery / Pickup
- [ ] Order summary sidebar
- [ ] Auto-calculate totals (add delivery fee if applicable)
- [ ] Submit button → Create order → Clear cart → Redirect

### Step 5.4 - Confirmation Page
- [ ] Success animation/icon
- [ ] Order ID display
- [ ] Items summary list
- [ ] Estimated preparation time
- [ ] "Back to Menu" button

### Step 5.5 - Admin Dashboard
- [ ] Protected route with admin auth check
- [ ] Login form for admin
- [ ] Live orders list (auto-updates via Socket.io)
- [ ] New order notification (sound + visual badge)
- [ ] Order details modal
- [ ] Status update buttons: Pending → Preparing → Ready → Delivered
- [ ] Analytics cards: Today's orders count, Revenue

---

## Phase 6: Styling & UX

### Step 6.1 - Color Palette
```css
Primary Red: #E63946
Secondary Orange: #FF8C42
Background: #FAFAFA
Dark Text: #1A1A2E
Light Text: #6B7280
Success Green: #10B981
Warning: #F59E0B
```

### Step 6.2 - Typography
- [ ] Font: Inter (Google Fonts)
- [ ] Headings: Bold, tight letter-spacing
- [ ] Body: Regular, comfortable line-height

### Step 6.3 - Animations & Interactions
- [ ] Product card hover: subtle scale + shadow lift
- [ ] Cart drawer: slide-in from right with backdrop
- [ ] Button hover: background color transition (150ms)
- [ ] Loading states: skeleton loaders for images
- [ ] Toast notifications for add-to-cart feedback

---

## Phase 7: Testing & Polish

### Step 7.1 - Functionality Testing
- [ ] Test full order flow: browse → add to cart → checkout → confirm
- [ ] Test admin dashboard receives new orders in real-time
- [ ] Test status updates reflect on admin dashboard
- [ ] Test mobile responsiveness on all pages
- [ ] Test form validation on checkout form

### Step 7.2 - Error Handling
- [ ] API error responses with proper status codes
- [ ] Frontend error toasts for failed actions
- [ ] Empty states for: empty cart, no products, no orders
- [ ] Loading states during data fetches

### Step 7.3 - Performance
- [ ] Image optimization with Next.js Image component
- [ ] API response caching where appropriate
- [ ] Debounced search input

---

## Phase 8: Documentation

### Step 8.1 - Setup Instructions
- [ ] Environment variables template (.env.example)
- [ ] Database setup commands
- [ ] Run instructions for frontend and backend

### Step 8.2 - API Documentation
- [ ] Endpoint descriptions with request/response examples
- [ ] Authentication flow explanation

---

## Database Models Reference

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| address | TEXT | |
| role | VARCHAR(20) | DEFAULT 'customer' |
| created_at | TIMESTAMP | DEFAULT NOW() |

### products
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| price | DECIMAL(10,2) | NOT NULL |
| image_url | TEXT | NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| is_available | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT NOW() |

### orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| customer_name | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | NOT NULL |
| address | TEXT | |
| delivery_type | VARCHAR(20) | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'pending' |
| total_price | DECIMAL(10,2) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

### order_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| order_id | INTEGER | FK orders(id) |
| product_id | INTEGER | FK products(id) |
| quantity | INTEGER | NOT NULL |
| price_at_purchase | DECIMAL(10,2) | NOT NULL |

---

## API Endpoints Reference

### Authentication
```
POST /api/auth/register
  Body: { name, phone, password, address }
  Response: { user, token }

POST /api/auth/login
  Body: { phone, password }
  Response: { user, token }
```

### Products
```
GET /api/products
  Query: ?category=burgers
  Response: { products: [...] }

GET /api/products/:id
  Response: { product }

POST /api/products (admin)
  Headers: Authorization: Bearer <token>
  Body: { name, description, price, image_url, category }
```

### Orders
```
POST /api/orders
  Body: { customer_name, phone, address, delivery_type, items: [{product_id, quantity}] }
  Response: { order }

GET /api/orders (admin)
  Response: { orders: [...] }

PATCH /api/orders/:id/status (admin)
  Body: { status: 'preparing' | 'ready' | 'delivered' }
  Response: { order }
```

### WebSocket Events
```
Server → Client:
  'new-order' - { order }
  'order-updated' - { order_id, status }

Client → Server:
  'join-admin' - authenticate as admin
```

---

## Seed Product Data

| Name | Category | Price | Unsplash Query |
|------|----------|-------|----------------|
| Classic Burger | Burgers | $8.99 | burger |
| Cheese Burger | Burgers | $9.99 | cheeseburger |
| Double Patty Burger | Burgers | $12.99 | double burger |
| Crispy Fries | Fries | $3.99 | french fries |
| Loaded Fries | Fries | $5.99 | loaded fries |
| Onion Rings | Fries | $4.99 | onion rings |
| Cola | Drinks | $2.49 | cola soda |
| Lemonade | Drinks | $2.99 | lemonade |
| Milkshake | Drinks | $4.99 | milkshake |
| Burger Combo | Combos | $14.99 | burger fries |
| Family Pack | Combos | $29.99 | family meal |

---

## Deployment Checklist

- [ ] Set up PostgreSQL database (local or hosted)
- [ ] Configure environment variables
- [ ] Set up production build for frontend
- [ ] Set up PM2 or similar for backend process management
- [ ] Configure CORS for production domain
- [ ] Set up SSL certificate
- [ ] Test in production environment

---

## Future SaaS Extensions

- [ ] Multi-restaurant support with subdomain routing
- [ ] Restaurant admin registration
- [ ] Menu customization per restaurant
- [ ] Payment integration (Stripe)
- [ ] SMS notifications (Twilio)
  - **Technical Plan**:
    - Integrate `twilio` SDK in backend.
    - Create `smsService.js` for `sendOrderAlert` and `sendAdminAlert`.
    - Hook into `orderController.js` to trigger SMS on order creation.
    - Required Env Vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `ADMIN_PHONE_NUMBER`.
- [ ] Analytics dashboard
- [ ] Customer loyalty program
- [ ] Promo codes
- [ ] Mobile app (React Native)