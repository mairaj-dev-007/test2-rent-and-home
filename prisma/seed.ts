import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.userFavorite.deleteMany()
  await prisma.picture.deleteMany()
  await prisma.house.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create system user
  const hashedPassword = await bcrypt.hash('system123', 12)
  const systemUser = await prisma.user.create({
    data: {
      email: 'system@gmail.com',
      password: hashedPassword,
      name: 'System User'
    }
  })

  console.log('👤 Created system user:', systemUser.email)

  // Read data from data.json
  const dataPath = path.join(__dirname, 'data.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const jsonData = JSON.parse(rawData)

  if (!jsonData.data || !Array.isArray(jsonData.data)) {
    throw new Error('Invalid data.json format')
  }

  console.log(`📊 Found ${jsonData.data.length} houses in data.json`)

  // Process each house
  for (const houseData of jsonData.data) {
    try {
      // Create house
      const house = await prisma.house.create({
        data: {
          mongoId: houseData._id,
          zpid: houseData.zpid,
          streetAddress: houseData.address?.streetAddress || '',
          city: houseData.address?.city || '',
          state: houseData.address?.state || '',
          zipcode: houseData.address?.zipcode || '',
          neighborhood: houseData.address?.neighborhood,
          community: houseData.address?.community,
          subdivision: houseData.address?.subdivision,
          bedrooms: houseData.bedrooms || 0,
          bathrooms: houseData.bathrooms || 0,
          price: houseData.price || 0,
          yearBuilt: houseData.yearBuilt || 0,
          longitude: houseData.longitude || 0,
          latitude: houseData.latitude || 0,
          homeStatus: houseData.homeStatus || 'For Sale',
          description: houseData.description || '',
          livingArea: houseData.livingArea || 0,
          currency: houseData.currency || 'USD',
          homeType: houseData.homeType || '',
          datePostedString: houseData.datePostedString || new Date().toISOString(),
          daysOnZillow: houseData.daysOnZillow,
          url: houseData.url || '',
          version: houseData.__v || 0,
          createdAt: houseData.createdAt ? new Date(houseData.createdAt) : new Date(),
          updatedAt: houseData.updatedAt ? new Date(houseData.updatedAt) : new Date(),
        }
      })

      // Create pictures for this house
      if (houseData.photos && Array.isArray(houseData.photos)) {
        for (let i = 0; i < houseData.photos.length; i++) {
          await prisma.picture.create({
            data: {
              url: houseData.photos[i],
              altText: `${houseData.address?.streetAddress || 'House'} - Photo ${i + 1}`,
              isPrimary: i === 0, // First photo is primary
              order: i,
              houseId: house.id
            }
          })
        }
      }

      // Create a favorite for the system user (so all houses appear in their favorites)
      await prisma.userFavorite.create({
        data: {
          userId: systemUser.id,
          houseId: house.id
        }
      })

    } catch (error) {
      console.error(`❌ Error processing house ${houseData._id}:`, error)
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`🏠 Created ${jsonData.data.length} houses`)
  console.log(`📸 Created pictures for all houses`)
  console.log(`❤️  Added all houses to system user favorites`)
  console.log(`👤 System user: system@gmail.com / system123`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 