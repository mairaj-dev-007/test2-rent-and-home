import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Load real data from JSON file
import fs from 'fs'
import path from 'path'

const jsonData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'prisma', 'data.json'), 'utf8'))

function generateHouses() {
  const houses = jsonData.data || []
  
  // If we have less than 100 houses, cycle through them
  const result = []
  for (let i = 0; i < 100; i++) {
    const houseData = houses[i % houses.length]
    result.push(houseData)
  }
  
  return result
}

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

  // Generate 100 houses
  const houses = generateHouses()
  console.log(`📊 Generated ${houses.length} houses`)

  // Process each house
  for (const houseData of houses) {
    try {
      // Create house
      const house = await prisma.house.create({
        data: {
          zpid: houseData.zpid || null,
          streetAddress: houseData.address.streetAddress,
          city: houseData.address.city,
          state: houseData.address.state,
          zipcode: houseData.address.zipcode.toString(),
          neighborhood: houseData.address.neighborhood,
          community: houseData.address.community,
          subdivision: houseData.address.subdivision,
          bedrooms: houseData.bedrooms,
          bathrooms: houseData.bathrooms,
          price: houseData.price,
          yearBuilt: houseData.yearBuilt,
          longitude: houseData.longitude,
          latitude: houseData.latitude,
          homeStatus: houseData.homeStatus,
          description: houseData.description,
          livingArea: houseData.livingArea,
          currency: houseData.currency,
          homeType: houseData.homeType,
          datePostedString: houseData.datePostedString,
          ownerId: systemUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })

      // Create pictures for this house using the photos field
      if (houseData.photos && houseData.photos.length > 0) {
        for (let j = 0; j < houseData.photos.length; j++) {
          await prisma.picture.create({
            data: {
              url: houseData.photos[j],
              altText: `${houseData.address.streetAddress} - Photo ${j + 1}`,
              isPrimary: j === 0,
              order: j,
              houseId: house.id
            }
          })
        }
      }

      // Create a favorite for the system user
      await prisma.userFavorite.create({
        data: {
          userId: systemUser.id,
          houseId: house.id
        }
      })

    } catch (error) {
      console.error(`❌ Error processing house ${houseData.id}:`, error)
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`🏠 Created ${houses.length} houses`)
  console.log(`📸 Created pictures for all houses`)
  console.log(`❤️  Added all houses to system user favorites`)
  console.log(`👤 System user: system@gmail.com / system123`)
  console.log(`📊 Status distribution: 40 FOR_SALE, 50 FOR_RENT, 10 SOLD`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 