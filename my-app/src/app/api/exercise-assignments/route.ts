// app/api/exercise-assignments/route.ts
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
    const therapistId = searchParams.get('therapistId')

    if (patientId) {
      const assignments = await db.getExerciseAssignmentsByPatientId(patientId)
      
      // Get exercise details for each assignment
      const assignmentsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const exercise = await db.getExerciseById(assignment.exerciseId)
          return {
            ...assignment,
            exercise
          }
        })
      )
      
      return NextResponse.json({ assignments: assignmentsWithDetails })
    } else if (therapistId) {
      const assignments = await db.getExerciseAssignmentsByTherapistId(therapistId)
      
      // Get exercise and patient details
      const assignmentsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const exercise = await db.getExerciseById(assignment.exerciseId)
          // Note: In a real app, you'd get patient details here too
          return {
            ...assignment,
            exercise
          }
        })
      )
      
      return NextResponse.json({ assignments: assignmentsWithDetails })
    } else {
      return NextResponse.json({ error: 'Patient ID or Therapist ID required' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching exercise assignments:', error)
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
    const { therapistId, patientId, exerciseId, dueDate, targetReps, targetSets, targetDuration, notes } = body

    // Verify therapist exists and belongs to current user
    const therapist = await db.getTherapistByUserId(userId)
    if (!therapist || therapist.id !== therapistId) {
      return NextResponse.json({ error: 'Unauthorized - Invalid therapist' }, { status: 403 })
    }

    const assignment = await db.createExerciseAssignment({
      therapistId,
      patientId,
      exerciseId,
      assignedDate: new Date().toISOString(),
      dueDate,
      targetReps,
      targetSets,
      targetDuration,
      notes,
      status: 'assigned'
    })

    // Get exercise details
    const exercise = await db.getExerciseById(exerciseId)

    return NextResponse.json({ 
      assignment: {
        ...assignment,
        exercise
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating exercise assignment:', error)
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
    const { assignmentId, status, ...updates } = body

    const assignment = await db.updateExerciseAssignment(assignmentId, { 
      status, 
      ...updates 
    })
    
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error('Error updating exercise assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
