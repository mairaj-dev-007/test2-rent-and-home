import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status');
    const exclude = searchParams.get('exclude');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const where: any = {};
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
    // Get the current user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const house = await prisma.house.create({
      data: {
        streetAddress: body.streetAddress || '',
        city: body.city || '',
        state: body.state || '',
        zipcode: body.zipcode || '',
        neighborhood: body.neighborhood,
        community: body.community,
        subdivision: body.subdivision,
        bedrooms: body.bedrooms || 0,
        bathrooms: body.bathrooms || 0,
        price: body.price || 0,
        yearBuilt: body.yearBuilt || 0,
        longitude: body.longitude || 0,
        latitude: body.latitude || 0,
        homeStatus: body.homeStatus || 'FOR_SALE',
        description: body.description || '',
        livingArea: body.livingArea || 0,
        currency: body.currency || 'USD',
        homeType: body.homeType || '',
        datePostedString: body.datePostedString || new Date().toISOString(),
        ownerId: session.user.id,
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