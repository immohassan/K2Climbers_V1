import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@k2climbers.com' },
    update: {},
    create: {
      email: 'admin@k2climbers.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })

  // Create guide
  const guidePassword = await bcrypt.hash('guide123', 10)
  const guide = await prisma.user.upsert({
    where: { email: 'guide@k2climbers.com' },
    update: {},
    create: {
      email: 'guide@k2climbers.com',
      name: 'John Guide',
      password: guidePassword,
      role: 'GUIDE',
      bio: 'Experienced mountaineering guide with 15+ years of experience.',
    },
  })

  // Create climber
  const climberPassword = await bcrypt.hash('climber123', 10)
  const climber = await prisma.user.upsert({
    where: { email: 'climber@k2climbers.com' },
    update: {},
    create: {
      email: 'climber@k2climbers.com',
      name: 'Jane Climber',
      password: climberPassword,
      role: 'CLIMBER',
      bio: 'Passionate mountaineer exploring peaks around the world.',
    },
  })

  // Create expedition
  const expedition = await prisma.expedition.create({
    data: {
      title: 'K2 Base Camp Trek',
      slug: 'k2-base-camp-trek',
      description: `Experience the ultimate adventure with our K2 Base Camp Trek. This challenging expedition takes you through some of the most breathtaking landscapes in the Karakoram Range.

You'll trek through remote valleys, cross glacial rivers, and witness some of the world's highest peaks. Our experienced guides will ensure your safety while you push your limits and create memories that will last a lifetime.

The journey includes acclimatization days, cultural experiences with local communities, and the opportunity to witness sunrise over K2, the world's second-highest mountain.`,
      shortDescription: 'A challenging trek to the base of the world\'s second-highest mountain',
      category: 'TREKKING_PEAKS',
      difficulty: 'ADVANCED',
      altitude: 5150,
      duration: 18,
      basePrice: 3500,
      location: 'Pakistan, Karakoram Range',
      heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      ],
      maxGroupSize: 12,
      minGroupSize: 4,
      featured: true,
      isActive: true,
      successRate: 85,
      guides: {
        connect: [{ id: guide.id }],
      },
    },
  })

  // Create itinerary
  await prisma.itinerary.createMany({
    data: [
      {
        expeditionId: expedition.id,
        dayNumber: 1,
        title: 'Arrival in Islamabad',
        description: 'Arrive at Islamabad International Airport. Transfer to hotel and briefing session.',
        activities: ['Airport pickup', 'Hotel check-in', 'Expedition briefing'],
      },
      {
        expeditionId: expedition.id,
        dayNumber: 2,
        title: 'Fly to Skardu',
        description: 'Early morning flight to Skardu with stunning views of the Karakoram Range.',
        activities: ['Flight to Skardu', 'Equipment check', 'Rest day'],
      },
      {
        expeditionId: expedition.id,
        dayNumber: 3,
        title: 'Drive to Askole',
        description: 'Drive to Askole, the last village before the trek begins.',
        altitude: 3050,
        activities: ['Scenic drive', 'Final preparations'],
      },
      {
        expeditionId: expedition.id,
        dayNumber: 4,
        title: 'Trek to Jhola',
        description: 'Begin the trek following the Braldu River.',
        altitude: 3200,
        activities: ['Trekking', 'River crossing'],
      },
      {
        expeditionId: expedition.id,
        dayNumber: 5,
        title: 'Trek to Paiju',
        description: 'Continue through beautiful valleys with views of Trango Towers.',
        altitude: 3380,
        activities: ['Trekking', 'Photography'],
      },
    ],
  })

  // Create products
  const boots = await prisma.product.create({
    data: {
      name: 'Mountaineering Boots - La Sportiva Nepal Cube',
      slug: 'mountaineering-boots-la-sportiva',
      description: 'High-altitude mountaineering boots perfect for expeditions above 6000m.',
      category: 'BOOTS',
      price: 650,
      rentalPrice: 25,
      securityDeposit: 200,
      images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80'],
      isRentable: true,
      inStock: true,
      stockQuantity: 10,
    },
  })

  const tent = await prisma.product.create({
    data: {
      name: '4-Season Expedition Tent',
      slug: '4-season-expedition-tent',
      description: 'Ultra-durable tent designed for extreme weather conditions.',
      category: 'TENTS',
      price: 1200,
      rentalPrice: 40,
      securityDeposit: 300,
      images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&q=80'],
      isRentable: true,
      inStock: true,
      stockQuantity: 8,
    },
  })

  // Link gear to expedition
  await prisma.expeditionGear.createMany({
    data: [
      {
        expeditionId: expedition.id,
        productId: boots.id,
        required: true,
        quantity: 1,
      },
      {
        expeditionId: expedition.id,
        productId: tent.id,
        required: true,
        quantity: 1,
      },
    ],
  })

  // Create summit record
  await prisma.summitRecord.create({
    data: {
      userId: climber.id,
      expeditionId: expedition.id,
      status: 'SUCCESSFUL',
      summitDate: new Date('2024-06-15'),
      altitude: 5150,
      notes: 'Amazing experience! The views were incredible.',
      photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
    },
  })

  console.log('Seed completed successfully!')
  console.log('Admin credentials: admin@k2climbers.com / admin123')
  console.log('Guide credentials: guide@k2climbers.com / guide123')
  console.log('Climber credentials: climber@k2climbers.com / climber123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
