// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const therapistId = searchParams.get('therapistId')

    if (therapistId) {
      // Get patients for a specific therapist
      const patients = await db.getPatientsByTherapistId(therapistId)
      return NextResponse.json({ patients })
    } else {
      // Get current user's patient profile
      const patient = await db.getPatientByUserId(userId)
      return NextResponse.json({ patient })
    }
  } catch (error) {
    console.error('Error fetching patients:', error)
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
    const { firstName, lastName, email, dateOfBirth, injuryType, injuryDate } = body

    // Check if patient already exists
    const existingPatient = await db.getPatientByUserId(userId)
    if (existingPatient) {
      return NextResponse.json({ error: 'Patient profile already exists' }, { status: 400 })
    }

    const patient = await db.createPatient({
      userId,
      firstName,
      lastName,
      email,
      dateOfBirth,
      injuryType,
      injuryDate
    })

    return NextResponse.json({ patient }, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patientId, ...updates } = body

    const patient = await db.updatePatient(patientId, updates)
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
