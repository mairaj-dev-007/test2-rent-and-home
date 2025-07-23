import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Generate fake house data
function generateHouses() {
  // Read original data.json to get existing images
  const dataPath = path.join(__dirname, '..', 'public', 'data.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const jsonData = JSON.parse(rawData)
  
  const existingImages: string[] = []
  if (jsonData.listings && Array.isArray(jsonData.listings)) {
    jsonData.listings.forEach((listing: any) => {
      if (listing.images && Array.isArray(listing.images)) {
        existingImages.push(...listing.images)
      }
    })
  }

  const cities = [
    { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 }
  ]

  const propertyTypes = ['Single Family', 'Apartment', 'Condo', 'Townhouse', 'Villa', 'Cottage']
  const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Birch Way', 'Willow Ct', 'Spruce St', 'Cherry Ave']
  const features = ['Fireplace', 'Hardwood Floors', 'Garden', 'Balcony', 'Pool', 'Garage', 'Central AC', 'Updated Kitchen', 'Walk-in Closet', 'Fenced Yard']

  const houses = []
  
  for (let i = 1; i <= 100; i++) {
    const city = cities[i % cities.length]
    const streetNum = Math.floor(Math.random() * 9999) + 1
    const street = streets[i % streets.length]
    const propertyType = propertyTypes[i % propertyTypes.length]
    const bedrooms = Math.floor(Math.random() * 5) + 1
    const bathrooms = Math.floor(Math.random() * 3) + 1
    const yearBuilt = Math.floor(Math.random() * 50) + 1970
    const livingArea = Math.floor(Math.random() * 3000) + 800
    const basePrice = propertyType === 'Apartment' ? 2000 : 300000
    const price = propertyType === 'Apartment' ? 
      Math.floor(Math.random() * 3000) + 1000 : 
      Math.floor(Math.random() * 800000) + 200000

    // Determine status based on index
    let status
    if (i <= 40) status = 'FOR_SALE'
    else if (i <= 90) status = 'FOR_RENT'
    else status = 'SOLD'

    // Generate random features
    const houseFeatures = features.slice(0, Math.floor(Math.random() * 5) + 2)

    // Use existing images from data.json, cycling through them
    const images = existingImages.length > 0 ? 
      [existingImages[i % existingImages.length]] : 
      ['https://example.com/imgs/h001-1.jpg', 'https://example.com/imgs/h001-2.jpg']

    houses.push({
      id: `H${i.toString().padStart(3, '0')}`,
      title: `${propertyType} in ${city.name}`,
      description: `Beautiful ${propertyType.toLowerCase()} with ${bedrooms} bedrooms and ${bathrooms} bathrooms. Features include ${houseFeatures.join(', ')}.`,
      price: price,
      currency: 'USD',
      propertyType: propertyType,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      areaSqFt: livingArea,
      yearBuilt: yearBuilt,
      address: {
        street: `${streetNum} ${street}`,
        city: city.name,
        state: city.state,
        zipcode: Math.floor(Math.random() * 99999) + 10000,
        country: 'USA'
      },
      location: {
        lat: city.lat + (Math.random() - 0.5) * 0.1,
        lng: city.lng + (Math.random() - 0.5) * 0.1
      },
      features: houseFeatures,
      images: images,
      listingDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: status
    })
  }

  return houses
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
          zpid: parseInt(houseData.id.replace('H', '')),
          streetAddress: houseData.address.street,
          city: houseData.address.city,
          state: houseData.address.state,
          zipcode: houseData.address.zipcode.toString(),
          bedrooms: houseData.bedrooms,
          bathrooms: houseData.bathrooms,
          price: houseData.price,
          yearBuilt: houseData.yearBuilt,
          longitude: houseData.location.lng,
          latitude: houseData.location.lat,
          homeStatus: houseData.status,
          description: houseData.description,
          livingArea: houseData.areaSqFt,
          currency: houseData.currency,
          homeType: houseData.propertyType,
          datePostedString: houseData.listingDate,
          ownerId: systemUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })

      // Create pictures for this house
      for (let j = 0; j < houseData.images.length; j++) {
        await prisma.picture.create({
          data: {
            url: houseData.images[j],
            altText: `${houseData.address.street} - Photo ${j + 1}`,
            isPrimary: j === 0,
            order: j,
            houseId: house.id
          }
        })
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