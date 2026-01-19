# K2 Climbers - Mountaineering & Expedition Platform

A comprehensive, scalable mountaineering and expedition platform built with Next.js, TypeScript, and Prisma.

## 🚀 Features

### Public Website
- **Homepage** with hero video, featured expeditions, and community stats
- **Expeditions & Tours** with detailed pages, itineraries, and booking
- **Custom Expedition Builder** for personalized adventures
- **Shop & Rental System** for mountaineering equipment
- **Community Profiles** showcasing climber achievements
- **Digital Summit Certificates** with QR code verification

### Admin Dashboard
- **Full CRUD** for all entities (expeditions, products, users, etc.)
- **Analytics Dashboard** with key metrics
- **Content Management** - edit all frontend content from admin
- **Booking Management** - view and manage all bookings
- **Certificate Generation** - issue and manage summit certificates

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js (role-based)
- **UI Components:** Radix UI + shadcn/ui

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd K2Climbers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database URL and NextAuth secret:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/k2climbers"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🔐 Default Credentials

After seeding, you can use these credentials:

- **Super Admin:** admin@k2climbers.com / admin123
- **Guide:** guide@k2climbers.com / guide123
- **Climber:** climber@k2climbers.com / climber123

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Admin dashboard
│   ├── expeditions/       # Public expedition pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── dashboard/        # Admin dashboard components
│   ├── expeditions/      # Expedition-related components
│   ├── home/             # Homepage components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
└── prisma/               # Database schema and migrations
    ├── schema.prisma     # Prisma schema
    └── seed.ts           # Seed data
```

## 🎨 Design System

- **Theme:** Dark mode first
- **Colors:** 
  - Glacier Blue (#0080cc)
  - Summit Orange/Red (#ff6b35)
  - Charcoal/Black backgrounds
  - Snow White accents
- **Typography:** Inter font family
- **Animations:** Subtle Framer Motion transitions

## 🔑 Key Features

### Role-Based Access Control
- **Super Admin:** Full system access
- **Admin:** Content and user management
- **Guide:** Expedition management
- **Climber:** Public access + personal dashboard

### Database-Driven Content
All content is stored in the database and editable through the admin dashboard. No hardcoded content.

### API Architecture
RESTful API routes for all data operations:
- `/api/expeditions` - Expedition CRUD
- `/api/bookings` - Booking management
- `/api/dashboard/stats` - Analytics data
- And more...

## 📝 Development

### Database Commands
```bash
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
npm run db:generate  # Generate Prisma client
```

### Build for Production
```bash
npm run build
npm start
```

## 🚧 Roadmap

- [ ] Payment integration
- [ ] Email notifications
- [ ] Advanced search and filters
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Real-time chat
- [ ] Weather integration
- [ ] GPS tracking

## 📄 License

This project is proprietary software.

## 🤝 Contributing

This is a private project. For contributions, please contact the project maintainers.
