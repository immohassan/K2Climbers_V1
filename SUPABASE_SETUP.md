# Supabase Database Setup Guide

## Connection String Formats

Supabase provides different connection strings depending on your use case. For Prisma, you need the **direct connection** or **connection pooling** string.

### Option 1: Direct Connection (Recommended for Prisma)

Format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

Or without pgbouncer:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Option 2: Connection Pooling (Better for production)

Format:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 3: Using Connection Pooler Port

Format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

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
# Supabase Database Connection
# Replace [YOUR-PASSWORD] with your actual database password
# Replace [PROJECT-REF] with your Supabase project reference

DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App
NODE_ENV="development"
```

## Steps to Fix Your Connection

1. **Get your Supabase connection string:**
   - Go to Supabase Dashboard → Settings → Database
   - Copy the connection string from the "URI" tab
   - Make sure it includes your password

2. **Update your .env file:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
   ```

3. **Test the connection:**
   ```powershell
   npm run db:push
   ```

4. **If still failing, try with SSL:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
   ```

5. **Or use connection pooling:**
   ```env
   DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

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
