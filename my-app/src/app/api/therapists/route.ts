// app/api/therapists/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const therapist = await db.getTherapistByUserId(userId)
    return NextResponse.json({ therapist })
  } catch (error) {
    console.error('Error fetching therapist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, licenseNumber, specialization } = body

    // Check if therapist already exists
    const existingTherapist = await db.getTherapistByUserId(userId)
    if (existingTherapist) {
      return NextResponse.json({ error: 'Therapist profile already exists' }, { status: 400 })
    }

    const therapist = await db.createTherapist({
      userId,
      firstName,
      lastName,
      email,
      licenseNumber,
      specialization
    })

    return NextResponse.json({ therapist }, { status: 201 })
  } catch (error) {
    console.error('Error creating therapist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
