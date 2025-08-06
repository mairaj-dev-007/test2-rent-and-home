import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const house = await prisma.house.findUnique({
      where: { id },
      include: {
        pictures: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!house) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: house })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the current user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if house exists and user owns it
    const existingHouse = await prisma.house.findUnique({
      where: { id }
    })

    if (!existingHouse) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      )
    }

    if (existingHouse.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own houses' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    const house = await prisma.house.update({
      where: {
        id
      },
      data: {
        streetAddress: body.streetAddress,
        city: body.city,
        state: body.state,
        zipcode: body.zipcode,
        neighborhood: body.neighborhood,
        community: body.community,
        subdivision: body.subdivision,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        price: body.price,
        yearBuilt: body.yearBuilt,
        longitude: body.longitude,
        latitude: body.latitude,
        homeStatus: body.homeStatus,
        description: body.description,
        livingArea: body.livingArea,
        currency: body.currency,
        homeType: body.homeType,
        datePostedString: body.datePostedString,
        zpid: body.zpid ? parseInt(String(body.zpid)) : null,
      }
    })

    return NextResponse.json({ data: house })

  } catch (error: unknown) {
    console.error('Database error:', error)
    
    // Handle Prisma unique constraint violation for zpid
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 
        'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta && 
        Array.isArray(error.meta.target) && error.meta.target.includes('zpid')) {
      return NextResponse.json({ 
        error: 'A house with this ZPID already exists. Please use a different ZPID or leave it empty.' 
      }, { status: 400 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the current user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if house exists and user owns it
    const existingHouse = await prisma.house.findUnique({
      where: { id }
    })

    if (!existingHouse) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      )
    }

    if (existingHouse.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own houses' },
        { status: 403 }
      )
    }

    await prisma.house.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ message: 'House deleted successfully' })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 