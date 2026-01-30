# Supabase Database Setup Guide

## Fix: "MaxClientsInSessionMode: max clients reached"

This error happens when using **Session mode** (port 5432 on the pooler or direct connection). Each serverless request holds a connection for the whole request, so you hit Supabase’s connection limit.

**Use Transaction mode instead:**

1. **App (runtime):** Use the **Transaction** pooler on port **6543** (not 5432):
   - In Supabase: **Settings → Database → Connection string → Transaction** (or "Connection pooling" with port **6543**).
   - Add `?pgbouncer=true&connection_limit=1` so Prisma works with PgBouncer and each instance uses one connection that is returned to the pool after each transaction.

2. **Migrations:** Use a **direct** connection so `prisma migrate` works. Set `DIRECT_URL` in `.env` (see below).

3. **Two URLs in `.env`:**
   ```env
   # App: Transaction mode pooler (port 6543) – avoids "max clients reached"
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

   # Migrations only: direct connection (port 5432)
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
   Replace `[PROJECT-REF]`, `[YOUR-PASSWORD]`, and `[REGION]` (e.g. `us-east-1`, `ap-northeast-2`) with your Supabase values. Get both URLs from **Settings → Database** in the Supabase dashboard.

---

## Connection String Formats

### Option 1: Transaction mode pooler (recommended for production / serverless)

Use this as **DATABASE_URL** to avoid "max clients reached":

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

- Port **6543** = Transaction mode (connections returned after each transaction).
- Port 5432 on the pooler = Session mode (connection held for whole request → limit hit quickly).

### Option 2: Direct connection (for DIRECT_URL / migrations)

Use this as **DIRECT_URL** (required for `prisma migrate`):

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Add `?sslmode=require` if your project requires SSL.

## How to Get Your Credentials

1. Go to your Supabase project dashboard
2. Click on **Settings** → **Database**
3. Scroll down to **Connection string**
4. Select **URI** tab
5. Copy the connection string

## Common Issues

### Issue 1: Can't reach database server
**Solution:** Make sure you're using the correct port:
- Direct connection: Port `5432`
- Connection pooling: Port `6543` or use the pooler URL

### Issue 2: SSL Required
**Solution:** Add SSL parameters to your connection string:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### Issue 3: Connection Pooling
**Solution:** For Prisma, use the direct connection (port 5432) or add `pgbouncer=true`:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
```

## Example .env File

```env
# Supabase – use Transaction mode (6543) to avoid "max clients reached"
# Get both URLs from Supabase Dashboard → Settings → Database

# App runtime (Transaction pooler, port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Migrations only (direct connection, port 5432)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App
NODE_ENV="development"
```

Replace `[PROJECT-REF]`, `[YOUR-PASSWORD]`, and `[REGION]` (e.g. `ap-northeast-2`) with your values.

## Steps to Fix Your Connection (and "max clients reached")

1. **Get both URLs from Supabase:**
   - Go to **Supabase Dashboard → Settings → Database**
   - Under **Connection string**, copy:
     - **URI** (Transaction) or **Connection pooling** with port **6543** → use for `DATABASE_URL`
     - **URI** (Direct) or the direct `db....supabase.co:5432` URL → use for `DIRECT_URL`

2. **Update your .env** (and Vercel → Settings → Environment Variables):
   ```env
   DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
   ```
   Use your actual project ref, password, and region (e.g. `ap-northeast-2`).

3. **Test the connection:**
   ```powershell
   npx prisma generate
   npx prisma db push
   ```
   Migrations use `DIRECT_URL`; the app uses `DATABASE_URL` (Transaction pooler).

## Verify Connection

After updating your .env, test with:
```powershell
npm run db:push
```

If successful, you'll see:
```
✔ Generated Prisma Client
✔ Database synchronized
```

## Troubleshooting

### "DIRECT_URL is not set" or Prisma fails at generate
Add `DIRECT_URL` to your `.env` (and to Vercel → Settings → Environment Variables). Use the **direct** connection (db.xxx:5432). See the Example .env above.

### Check if Supabase is accessible:
```powershell
# Test if you can reach Supabase
Test-NetConnection db.YOUR_PROJECT_REF.supabase.co -Port 5432
```

### Check your firewall:
- Make sure port 5432 (or 6543) is not blocked
- Some networks block database ports

### Use Supabase's connection pooler:
If direct connection doesn't work, use the pooler URL from your Supabase dashboard.
