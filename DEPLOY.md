# Railway Deployment Guide

## Quick Deploy

### 1. Backend API (Railway)

1. Go to [railway.gg](https://railway.gg) and sign up/login
2. Click **New Project** → **Deploy from GitHub repo**
3. Connect your repository
4. Railway will auto-detect Node.js

**Settings:**
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
```
PORT=5000
JWT_SECRET=<generate-secure-random-string>
DB_HOST=<your-neon-hostname>.neon.tech
DB_PORT=5432
DB_NAME=food_ordering
DB_USER=<your-neon-username>
DB_PASSWORD=<your-neon-password>
DB_SSL=true
```

### 2. Database (Neon - Free PostgreSQL)

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

**Connection Details:**
- Host: `xxx.us-east-2.aws.neon.tech`
- Database: `food_ordering`
- User: found in connection string
- Password: your password

### 3. Frontend (Vercel - Recommended)

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Or connect GitHub repo in [vercel.com](https://vercel.com)

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://<your-railway-backend>.railway.app/api
```

### 4. Initialize Database

After backend is deployed, run migrations:

```bash
curl -X POST https://<your-backend>.railway.app/api/health
# Then manually trigger:
# 1. Connect to Neon database
# 2. Run the SQL from backend/database/migrate.js
# 3. Seed data from backend/database/seed.js
```

Or create a one-time Railway deployment with:
```bash
npm run db:migrate && npm run db:seed
```

---

## Default Admin Account

After seeding:
- **Phone:** `1234567890`
- **Password:** `admin123`

---

## Troubleshooting

**CORS errors?**
- Update allowed origins in backend `src/index.js`

**WebSocket not connecting?**
- Ensure Railway allows WebSocket connections
- Check `socket.io` CORS configuration

**Database connection failed?**
- Verify Neon credentials
- Enable SSL in connection (Neon requires it)