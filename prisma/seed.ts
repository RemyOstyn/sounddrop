import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Memes',
    slug: 'memes',
    icon: 'Laugh',
    description: 'Popular internet memes and viral sounds',
    order: 1,
  },
  {
    name: 'Movies',
    slug: 'movies',
    icon: 'Film',
    description: 'Iconic movie quotes and sound effects',
    order: 2,
  },
  {
    name: 'TV Shows',
    slug: 'tv-shows',
    icon: 'Tv',
    description: 'Memorable TV show moments and catchphrases',
    order: 3,
  },
  {
    name: 'Games',
    slug: 'games',
    icon: 'Gamepad2',
    description: 'Video game sounds and music',
    order: 4,
  },
  {
    name: 'Reactions',
    slug: 'reactions',
    icon: 'MessageCircle',
    description: 'Reaction sounds for any situation',
    order: 5,
  },
  {
    name: 'Music',
    slug: 'music',
    icon: 'Music',
    description: 'Music clips and beats',
    order: 6,
  },
  {
    name: 'Animals',
    slug: 'animals',
    icon: 'Cat',
    description: 'Animal sounds and nature clips',
    order: 7,
  },
  {
    name: 'Sports',
    slug: 'sports',
    icon: 'Trophy',
    description: 'Sports commentary and crowd reactions',
    order: 8,
  },
  {
    name: 'Sound Effects',
    slug: 'sound-effects',
    icon: 'Volume2',
    description: 'Various sound effects and audio clips',
    order: 9,
  },
  {
    name: 'Other',
    slug: 'other',
    icon: 'FolderOpen',
    description: 'Miscellaneous sounds that don\'t fit elsewhere',
    order: 10,
  },
]

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing categories
  console.log('🗑️ Clearing existing categories...')
  await prisma.category.deleteMany()

  // Create categories
  console.log('📂 Creating categories...')
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category,
    })
    console.log(`✅ Created category: ${created.name}`)
  }

  console.log(`🎉 Seeding completed! Created ${categories.length} categories.`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })