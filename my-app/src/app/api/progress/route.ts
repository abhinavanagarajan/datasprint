// app/api/progress/route.ts
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
    const patientId = searchParams.get('patientId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
    }

    const progressEntries = await db.getProgressEntriesByPatientId(patientId)
    const analytics = await db.getPatientAnalytics(patientId, days)

    return NextResponse.json({ 
      progressEntries,
      analytics
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
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
    const { 
      patientId, 
      exerciseAssignmentId, 
      exerciseName, 
      duration, 
      accuracy, 
      score, 
      reps, 
      sets, 
      feedback,
      videoAnalysisData 
    } = body

    // Verify patient belongs to current user
    const patient = await db.getPatientByUserId(userId)
    if (!patient || patient.id !== patientId) {
      return NextResponse.json({ error: 'Unauthorized - Invalid patient' }, { status: 403 })
    }

    const progressEntry = await db.createProgressEntry({
      patientId,
      exerciseAssignmentId,
      date: new Date().toISOString().split('T')[0],
      exerciseName,
      duration,
      accuracy,
      score,
      reps,
      sets,
      feedback,
      videoAnalysisData
    })

    // Update assignment status if applicable
    if (exerciseAssignmentId) {
      await db.updateExerciseAssignment(exerciseAssignmentId, {
        status: 'in_progress'
      })
    }

    return NextResponse.json({ progressEntry }, { status: 201 })
  } catch (error) {
    console.error('Error creating progress entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
