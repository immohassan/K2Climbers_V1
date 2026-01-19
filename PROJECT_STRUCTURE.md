# K2 Climbers - Project Structure

## 📁 Directory Overview

```
K2Climbers/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── expeditions/          # Expedition CRUD
│   │   ├── bookings/             # Booking management
│   │   ├── certificates/         # Certificate generation
│   │   ├── products/             # Shop products
│   │   ├── users/                # User management
│   │   └── dashboard/            # Dashboard analytics
│   ├── auth/                     # Auth pages
│   │   └── signin/               # Sign in page
│   ├── dashboard/                # Admin dashboard
│   │   ├── expeditions/         # Expedition management
│   │   ├── products/             # Product management
│   │   ├── users/                # User management
│   │   └── settings/             # Site settings
│   ├── expeditions/              # Public expedition pages
│   │   └── [slug]/               # Individual expedition
│   ├── globals.css               # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                  # Homepage
│
├── components/                   # React Components
│   ├── dashboard/                # Admin components
│   │   ├── dashboard-nav.tsx
│   │   ├── dashboard-stats.tsx
│   │   ├── recent-bookings.tsx
│   │   ├── top-expeditions.tsx
│   │   └── expeditions-table.tsx
│   ├── expeditions/              # Expedition components
│   │   ├── expedition-header.tsx
│   │   ├── expedition-details.tsx
│   │   ├── expedition-itinerary.tsx
│   │   ├── booking-panel.tsx
│   │   └── expeditions-list.tsx
│   ├── home/                     # Homepage components
│   │   ├── hero-section.tsx
│   │   ├── stats-section.tsx
│   │   ├── featured-expeditions.tsx
│   │   ├── featured-climbers.tsx
│   │   └── community-stories.tsx
│   ├── providers/                 # Context providers
│   │   └── session-provider.tsx
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── navbar.tsx                 # Main navigation
│   └── theme-provider.tsx          # Theme provider
│
├── lib/                          # Utility Libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Helper functions
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data
│
├── types/                        # TypeScript Types
│   └── next-auth.d.ts            # NextAuth type extensions
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts           # Tailwind config
├── next.config.js                # Next.js config
└── README.md                     # Documentation
```

## 🗄️ Database Schema

### Core Models
- **User** - Users with roles (SUPER_ADMIN, ADMIN, GUIDE, CLIMBER)
- **Expedition** - Mountaineering expeditions
- **Itinerary** - Day-by-day expedition plans
- **SummitRecord** - Climbing attempts and successes
- **Certificate** - Digital summit certificates
- **Product** - Shop items (buy/rent)
- **Rental** - Equipment rentals
- **Booking** - Expedition bookings
- **CommunityPost** - Community stories
- **SiteSettings** - Admin-configurable settings

## 🔌 API Routes

### Public Routes
- `GET /api/expeditions` - List expeditions
- `GET /api/expeditions/[id]` - Get expedition details
- `GET /api/products` - List products

### Protected Routes (Auth Required)
- `GET /api/bookings` - User's bookings
- `POST /api/bookings` - Create booking
- `GET /api/certificates` - User's certificates

### Admin Routes (Admin Only)
- `POST /api/expeditions` - Create expedition
- `PUT /api/expeditions/[id]` - Update expedition
- `DELETE /api/expeditions/[id]` - Delete expedition
- `GET /api/dashboard/stats` - Dashboard analytics
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `POST /api/certificates` - Issue certificate

## 🎨 Component Architecture

### Page Components
- Server Components for data fetching
- Client Components for interactivity
- Shared layouts for consistency

### Reusable Components
- UI components from shadcn/ui
- Custom components for domain logic
- Form components with validation

## 🔐 Authentication Flow

1. User signs in via `/auth/signin`
2. NextAuth validates credentials
3. JWT token includes user role
4. Protected routes check session
5. Admin routes verify role

## 📊 Data Flow

1. **Public Pages:** Fetch from database via Prisma
2. **Admin Dashboard:** Fetch via API routes
3. **Forms:** Submit to API routes
4. **Real-time Updates:** Client-side refetch

## 🎯 Key Features Implementation

### Expeditions
- Dynamic pages from database
- SEO-friendly slugs
- Rich content with images
- Itinerary management
- Booking integration

### Admin Dashboard
- Full CRUD operations
- Analytics and stats
- User management
- Content editing

### Certificates
- Auto-generation on summit
- QR code verification
- PDF export (future)
- Public verification URLs

## 🚀 Deployment Considerations

1. **Environment Variables:** Set all required vars
2. **Database:** Use managed PostgreSQL
3. **Build:** Run `npm run build` before deploy
4. **Migrations:** Run `prisma migrate deploy`
5. **Seeding:** Optional, run seed script

## 📝 Development Workflow

1. Make schema changes in `prisma/schema.prisma`
2. Run `npm run db:push` to sync database
3. Update types if needed
4. Test locally with `npm run dev`
5. Deploy after testing
