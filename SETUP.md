# K2 Climbers - Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

### 2. Installation Steps

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL and NEXTAUTH_SECRET

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/dashboard
- **Prisma Studio:** Run `npm run db:studio`

### 4. Default Login Credentials

After seeding:
- **Super Admin:** admin@k2climbers.com / admin123
- **Guide:** guide@k2climbers.com / guide123  
- **Climber:** climber@k2climbers.com / climber123

## Environment Variables

Required variables in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/k2climbers"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NODE_ENV="development"
```

To generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Database Setup

### Using PostgreSQL

1. Create a database:
```sql
CREATE DATABASE k2climbers;
```

2. Update DATABASE_URL in `.env`

3. Run migrations:
```bash
npm run db:push
```

### Using Docker (Optional)

```bash
docker run --name k2climbers-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=k2climbers \
  -p 5432:5432 \
  -d postgres:15
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Build Errors
- Delete `.next` folder and rebuild
- Run `npm run db:generate` if Prisma errors occur
- Check Node.js version (18+ required)

## Next Steps

1. **Customize Content:** Use admin dashboard to add/edit expeditions
2. **Configure Payment:** Integrate payment gateway (Stripe recommended)
3. **Set Up Email:** Configure email service for notifications
4. **Deploy:** Follow deployment guide for your hosting platform

## Support

For issues or questions, check the README.md or contact the development team.
