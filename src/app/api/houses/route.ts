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
  console.log('🚀 POST /api/houses - Starting request')
  try {
    console.log('🔐 Checking user session...')
    const session = await getServerSession(authOptions)
    console.log('📋 Session data:', { userId: session?.user?.id, userEmail: session?.user?.email })
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized - No valid session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📄 Parsing form data...')
    // Parse form data using formidable
    const { fields, files, tempDir } = await parseFormData(request)
    console.log('✅ Form data parsed successfully')
    console.log('📝 Fields received:', Object.keys(fields))
    console.log('🖼️ Files received:', Object.keys(files), 'Total files:', Object.values(files).flat().length)
    
    console.log('🏠 Preparing house data...')
    // Prepare house data
    const houseData: Record<string, string | number | null> = {}
    
    // Extract house data from fields
    Object.keys(fields).forEach(key => {
      houseData[key] = fields[key] || ''
    })
    console.log('📊 Raw house data extracted:', houseData)
    
    // Parse numeric fields
    console.log('🔢 Parsing numeric fields...')
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
    
    console.log('✅ Final house data prepared:', houseData)

    console.log('💾 Creating house in database...')
    // Create house
    const house = await prisma.house.create({ 
      data: houseData as unknown as Prisma.HouseUncheckedCreateInput 
    })
    console.log('🎉 House created successfully with ID:', house.id)

    console.log('🖼️ Starting image upload process...')
    // Handle image uploads
    const imageFiles = files.images || files.image || []
    const imageArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles]
    console.log('📸 Processing', imageArray.length, 'images')
    
    for (let i = 0; i < imageArray.length; i++) {
      const file = imageArray[i]
      console.log(`🖼️ Processing image ${i + 1}/${imageArray.length}:`, file?.originalFilename)
      
      if (!file || !file.filepath) {
        console.log(`⚠️ Skipping image ${i + 1} - no file or filepath`)
        continue
      }

      try {
        console.log(`📖 Reading file: ${file.filepath}`)
        // Read the file
        const fileBuffer = await fs.readFile(file.filepath)
        console.log(`✅ File read successfully, size: ${fileBuffer.length} bytes`)
        
        console.log(`☁️ Uploading to Cloudinary...`)
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
              if (error) {
                console.log(`❌ Cloudinary upload error:`, error)
                reject(error)
              } else if (result) {
                console.log(`✅ Cloudinary upload successful:`, result.secure_url)
                resolve(result)
              } else {
                console.log(`❌ Cloudinary upload failed - no result`)
                reject(new Error('Upload failed'))
              }
            }
          ).end(fileBuffer)
        })

        console.log(`💾 Saving image metadata to database...`)
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
        console.log(`✅ Image ${i + 1} saved to database successfully`)

        console.log(`🗑️ Cleaning up temporary file: ${file.filepath}`)
        // Clean up temporary file
        await fs.unlink(file.filepath)
        console.log(`✅ Temporary file cleaned up`)
      } catch (uploadError) {
        console.error(`❌ Error uploading image ${i + 1}:`, uploadError)
        // Continue with other images even if one fails
      }
    }

    console.log('🧹 Cleaning up temporary directory...')
    // Clean up temporary directory
    try {
      await fs.rmdir(tempDir)
      console.log('✅ Temporary directory cleaned up successfully')
    } catch (cleanupError) {
      console.error('❌ Error cleaning up temp directory:', cleanupError)
    }

    console.log('🎉 POST /api/houses completed successfully!')
    return NextResponse.json({ data: house }, { status: 201 })
  } catch (error: unknown) {
    console.error('💥 FATAL ERROR in house POST:', error)
    
    // Handle Prisma unique constraint violation for zpid
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 
        'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta && 
        Array.isArray(error.meta.target) && error.meta.target.includes('zpid')) {
      console.log('🔍 Detected ZPID duplicate error')
      return NextResponse.json({ 
        error: 'A house with this ZPID already exists. Please use a different ZPID or leave it empty.' 
      }, { status: 400 })
    }
    
    console.log('💥 Returning 500 error to client')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 