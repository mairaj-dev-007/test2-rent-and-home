import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const homeStatus = searchParams.get('homeStatus') || ''
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined
    const bathrooms = searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { streetAddress: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { zipcode: { contains: search, mode: 'insensitive' } },
        { homeType: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (homeStatus) {
      where.homeStatus = homeStatus
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (bedrooms !== undefined) {
      where.bedrooms = bedrooms
    }

    if (bathrooms !== undefined) {
      where.bathrooms = bathrooms
    }

    // Get total count for pagination
    const total = await prisma.house.count({ where })

    // Get houses with pagination and include pictures
    const houses = await prisma.house.findMany({
      where,
      skip,
      take: limit,
      include: {
        pictures: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      data: houses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
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
    const body = await request.json()
    
    const house = await prisma.house.create({
      data: {
        mongoId: body._id || body.mongoId,
        zpid: body.zpid,
        streetAddress: body.address?.streetAddress || body.streetAddress || '',
        city: body.address?.city || body.city || '',
        state: body.address?.state || body.state || '',
        zipcode: body.address?.zipcode || body.zipcode || '',
        neighborhood: body.address?.neighborhood || body.neighborhood,
        community: body.address?.community || body.community,
        subdivision: body.address?.subdivision || body.subdivision,
        bedrooms: body.bedrooms || 0,
        bathrooms: body.bathrooms || 0,
        price: body.price || 0,
        yearBuilt: body.yearBuilt || 0,
        longitude: body.longitude || 0,
        latitude: body.latitude || 0,
        homeStatus: body.homeStatus || 'For Sale',
        description: body.description || '',
        livingArea: body.livingArea || 0,
        currency: body.currency || 'USD',
        homeType: body.homeType || '',
        datePostedString: body.datePostedString || new Date().toISOString(),
        daysOnZillow: body.daysOnZillow,
        url: body.url || '',
        version: body.__v || body.version || 0,
      }
    })

    return NextResponse.json({ data: house }, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 