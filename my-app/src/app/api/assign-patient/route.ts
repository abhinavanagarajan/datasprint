// app/api/assign-patient/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { therapistId, patientId, notes } = body

    // Verify therapist belongs to current user
    const therapist = await db.getTherapistByUserId(userId)
    if (!therapist || therapist.id !== therapistId) {
      return NextResponse.json({ error: 'Unauthorized - Invalid therapist' }, { status: 403 })
    }

    const relation = await db.assignPatientToTherapist(therapistId, patientId, notes)

    return NextResponse.json({ relation }, { status: 201 })
  } catch (error) {
    console.error('Error assigning patient to therapist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
