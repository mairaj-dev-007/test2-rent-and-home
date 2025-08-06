import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import { Prisma } from '@prisma/client'

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

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

// Helper function to parse multipart form data with formidable
async function parseFormData(request: NextRequest) {
  const formData = await request.formData()
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'house-uploads-'))
  
  const fields: Record<string, string> = {}
  const files: Record<string, Array<{
    filepath: string;
    originalFilename: string;
    mimetype: string;
    size: number;
  }>> = {}
  
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file uploads
      if (!files[key]) files[key] = []
      
      // Save file to temp directory
      const tempFilePath = path.join(tempDir, `${Date.now()}-${value.name}`)
      const buffer = Buffer.from(await value.arrayBuffer())
      await fs.writeFile(tempFilePath, buffer)
      
      files[key].push({
        filepath: tempFilePath,
        originalFilename: value.name,
        mimetype: value.type,
        size: value.size
      })
    } else {
      // Handle regular form fields
      fields[key] = value as string
    }
  }
  
  return { fields, files, tempDir }
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

    // Parse form data using formidable
    const { fields, files, tempDir } = await parseFormData(request)
    
    // Prepare house data
    const houseData: Record<string, string | number | null> = {}
    
    // Extract house data from fields
    Object.keys(fields).forEach(key => {
      houseData[key] = fields[key] || ''
    })
    
    // Parse numeric fields
    houseData.bedrooms = parseInt(String(houseData.bedrooms || '0'))
    houseData.bathrooms = parseInt(String(houseData.bathrooms || '0'))
    houseData.price = parseFloat(String(houseData.price || '0'))
    houseData.yearBuilt = parseInt(String(houseData.yearBuilt || '0'))
    houseData.livingArea = parseInt(String(houseData.livingArea || '0'))
    houseData.longitude = parseFloat(String(houseData.longitude || '0'))
    houseData.latitude = parseFloat(String(houseData.latitude || '0'))
    houseData.zpid = houseData.zpid ? parseInt(String(houseData.zpid)) : null
    houseData.ownerId = session.user.id
    houseData.datePostedString = houseData.datePostedString ? String(houseData.datePostedString) : new Date().toISOString()

    // Create house
    const house = await prisma.house.create({ 
      data: houseData as unknown as Prisma.HouseUncheckedCreateInput 
    })

    // Handle image uploads
    const imageFiles = files.images || files.image || []
    const imageArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles]
    
    for (let i = 0; i < imageArray.length; i++) {
      const file = imageArray[i]
      if (!file || !file.filepath) continue

      try {
        // Read the file
        const fileBuffer = await fs.readFile(file.filepath)
        
        // Upload to Cloudinary
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: 'houses',
              resource_type: 'image',
              transformation: [
                { width: 1200, height: 800, crop: 'fill' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error)
              else if (result) resolve(result)
              else reject(new Error('Upload failed'))
            }
          ).end(fileBuffer)
        })

        // Save to database
        await prisma.picture.create({
          data: {
            url: result.secure_url,
            altText: `${house.streetAddress} - Photo ${i + 1}`,
            isPrimary: i === 0,
            order: i,
            houseId: house.id,
          },
        })

        // Clean up temporary file
        await fs.unlink(file.filepath)
      } catch (uploadError) {
        console.error(`Error uploading image ${i + 1}:`, uploadError)
        // Continue with other images even if one fails
      }
    }

    // Clean up temporary directory
    try {
      await fs.rmdir(tempDir)
    } catch (cleanupError) {
      console.error('Error cleaning up temp directory:', cleanupError)
    }

    return NextResponse.json({ data: house }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error in house POST:', error)
    
    // Handle Prisma unique constraint violation for zpid
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 
        'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta && 
        Array.isArray(error.meta.target) && error.meta.target.includes('zpid')) {
      return NextResponse.json({ 
        error: 'A house with this ZPID already exists. Please use a different ZPID or leave it empty.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 