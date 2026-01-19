# Build Error Fixes

## NextAuth Build Error

If you encounter build errors related to NextAuth, here are the solutions:

### Issue: Failed to collect page data for /api/auth/[...nextauth]

**Causes:**
1. Missing environment variables during build
2. Database connection attempted during build time
3. Prisma client not properly initialized

**Solutions:**

1. **Ensure all environment variables are set:**
   ```env
   DATABASE_URL="your-database-url"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

2. **For Vercel/Production builds:**
   - Add all environment variables in your deployment platform
   - Make sure `NEXTAUTH_SECRET` is set
   - Ensure `DATABASE_URL` is accessible from build environment

3. **If using Supabase:**
   - Use connection pooling URL for production
   - Ensure SSL mode is enabled: `?sslmode=require`

4. **Build command:**
   ```bash
   npm run db:generate
   npm run build
   ```

5. **If still failing:**
   - Check that Prisma client is generated: `npm run db:generate`
   - Verify database is accessible
   - Check build logs for specific error messages

### Common Build Issues

#### Missing Prisma Client
```bash
npm run db:generate
```

#### Database Connection During Build
- API routes are dynamic by default in Next.js 14
- The route handler should not try to connect during static analysis
- Added `export const dynamic = 'force-dynamic'` to prevent static generation

#### Environment Variables
- Make sure `.env` file exists
- For production, set variables in your hosting platform
- Never commit `.env` file to git
