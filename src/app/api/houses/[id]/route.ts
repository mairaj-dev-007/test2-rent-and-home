import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const house = await prisma.house.findUnique({
      where: {
        id: params.id
      },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const house = await prisma.house.update({
      where: {
        id: params.id
      },
      data: {
        mongoId: body._id || body.mongoId,
        zpid: body.zpid,
        streetAddress: body.address?.streetAddress || body.streetAddress,
        city: body.address?.city || body.city,
        state: body.address?.state || body.state,
        zipcode: body.address?.zipcode || body.zipcode,
        neighborhood: body.address?.neighborhood || body.neighborhood,
        community: body.address?.community || body.community,
        subdivision: body.address?.subdivision || body.subdivision,
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
        daysOnZillow: body.daysOnZillow,
        url: body.url,
        version: body.__v || body.version,
      }
    })

    return NextResponse.json({ data: house })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.house.delete({
      where: {
        id: params.id
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