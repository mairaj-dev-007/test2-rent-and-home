import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import { Prisma } from '@prisma/client'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status');
    const exclude = searchParams.get('exclude');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const where: Prisma.HouseWhereInput = {};
    if (status) where.homeStatus = status;
    if (exclude) where.id = { not: exclude };

    const houses = await prisma.house.findMany({
      where,
      include: {
        pictures: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit ? { take: limit } : {}),
    })

    return NextResponse.json({
      data: houses
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse multipart form data using FormData
    const formData = await request.formData()
    
    // Prepare house data
    const houseData: Record<string, string | number | null> = {}
    const images: File[] = []
    
    for (const [key, value] of formData.entries()) {
      if (key === 'images') {
        if (value instanceof File) {
          images.push(value)
        }
      } else {
        houseData[key] = value as string
      }
    }
    
    houseData.bedrooms = parseInt(String(houseData.bedrooms || '0'))
    houseData.bathrooms = parseInt(String(houseData.bathrooms || '0'))
    houseData.price = parseFloat(String(houseData.price || '0'))
    houseData.yearBuilt = parseInt(String(houseData.yearBuilt || '0'))
    houseData.livingArea = parseInt(String(houseData.livingArea || '0'))
    houseData.longitude = parseFloat(String(houseData.longitude || '0'))
    houseData.latitude = parseFloat(String(houseData.latitude || '0'))
    houseData.zpid = houseData.zpid ? parseInt(String(houseData.zpid)) : null
    houseData.ownerId = session.user.id
    houseData.datePostedString = houseData.datePostedString || new Date().toISOString();

    // Create house
    const house = await prisma.house.create({ data: houseData as unknown as Prisma.HouseUncheckedCreateInput })

    // Upload images to Cloudinary and store in pictures table
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const upload = await cloudinary.uploader.upload_stream(
        { folder: 'houses' },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            return
          }
          if (result) {
            await prisma.picture.create({
              data: {
                url: result.secure_url,
                altText: `${house.streetAddress} - Photo ${i + 1}`,
                isPrimary: i === 0,
                order: i,
                houseId: house.id,
              },
            })
          }
        }
      ).end(buffer)
    }

    return NextResponse.json({ data: house }, { status: 201 })
  } catch (error) {
    console.error('Error in house POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 