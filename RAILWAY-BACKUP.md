# Railway Configuration Snapshot

> Saved on 2026-11-11 before deleting the old Railway account.
> Use this to recreate the backend project on a new Railway account.

## 1. Project / Service

| Setting | Value |
|---|---|
| Project | food-ordering |
| Service | Backend API (Express + Socket.io) |
| Old public URL | `https://food-ordering-production-467d.up.railway.app` (⚠️ now dead — a new project will get a NEW URL) |
| Repo | GitHub repo containing this project |
| Root Directory | `backend` |
| Builder | NIXPACKS |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Healthcheck | `/api/health` (timeout 100) |
| Restart Policy | ON_FAILURE |

These are already encoded in `railway.toml` (root and `backend/railway.toml`), so a fresh
deploy from the repo picks them up automatically.

## 2. Environment Variables (Railway service)

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_Yet9vBSPG4Zn@ep-damp-tree-a4mcvm8r-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=food_ordering_secret_key_2024
```

Notes:
- `PORT` is injected by Railway automatically (code defaults to 5000 otherwise) — do NOT set it manually.
- The `DATABASE_URL` points to the existing Neon project — the database is separate from Railway,
  so all tables and seeded data survive the account switch. **No re-migration or re-seed needed.**

## 3. Backend source settings (no changes required)

- CORS is `origin: true` (all origins allowed) in `backend/src/index.js` — the new URL works with the
  Vercel frontend without code changes.
- Tables auto-create on server boot (`Running database migrations...` at startup).
- Health endpoint: `GET /api/health` → `{"status":"ok","database":"connected"}`

## 4. Frontend (Vercel) — must be updated after recreating

The deployed frontend has this baked in at build time:

```
NEXT_PUBLIC_API_URL=https://food-ordering-production-467d.up.railway.app/api
```

**After creating the new Railway project:**
1. Copy the new public URL (e.g. `https://<new-name>.up.railway.app`)
2. In Vercel → Project → Settings → Environment Variables, update:
   `NEXT_PUBLIC_API_URL=https://<new-url>/api`
3. Redeploy the frontend (Deployments → Redeploy) so the new URL is baked into the bundle

## 5. Database (Neon — unchanged)

- Provider: Neon, region `us-east-1`, pooled endpoint (`-pooler`)
- Database: `neondb` (tables: `users`, `products`, `orders`, `order_items`)
- Already migrated + seeded: 13 products, admin user
- Admin login: phone `1234567890` / password `admin123`

## 6. Post-deploy verification checklist

```powershell
# 1. Health
Invoke-RestMethod https://<new-url>/api/health

# 2. Products (expect 13)
(Invoke-RestMethod https://<new-url>/api/products).products.Count

# 3. Admin login (expect role: admin)
Invoke-RestMethod -Uri https://<new-url>/api/auth/login -Method Post -ContentType 'application/json' `
  -Body '{"phone":"1234567890","password":"admin123"}'
```
