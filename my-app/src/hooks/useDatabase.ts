// hooks/useDatabase.ts
'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'

interface Patient {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  injuryType: string
  injuryDate: string
  therapistId?: string
  createdAt: string
  updatedAt: string
}

interface Therapist {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  licenseNumber: string
  specialization: string
  createdAt: string
  updatedAt: string
}

interface Exercise {
  id: string
  name: string
  description: string
  instructions: string[]
  targetBodyParts: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  imageUrl?: string
  videoUrl?: string
  createdAt: string
}

interface ExerciseAssignment {
  id: string
  therapistId: string
  patientId: string
  exerciseId: string
  assignedDate: string
  dueDate?: string
  targetReps?: number
  targetSets?: number
  targetDuration?: number
  notes?: string
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped'
  exercise?: Exercise
  createdAt: string
  updatedAt: string
}

interface ProgressEntry {
  id: string
  patientId: string
  exerciseAssignmentId?: string
  date: string
  exerciseName: string
  duration: number
  accuracy: number
  score: number
  reps?: number
  sets?: number
  feedback: string[]
  videoAnalysisData?: any
  createdAt: string
}

interface PatientAnalytics {
  totalExercises: number
  totalTime: number
  averageAccuracy: number
  exerciseFrequency: Record<string, number>
  weeklyProgress: Array<{
    week: string
    exercises: number
    accuracy: number
    time: number
  }>
}

export const useDatabase = () => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Simple in-memory caches to avoid duplicate network calls within a session
  const therapistCache = useRef<Therapist | null>(null)
  const exercisesCache = useRef<Exercise[] | null>(null)

  // Patient methods
  const createPatient = async (patientData: {
    firstName: string
    lastName: string
    email: string
    dateOfBirth: string
    injuryType: string
    injuryDate: string
  }): Promise<Patient | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create patient')
      }

      const { patient } = await response.json()
      return patient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getPatient = async (userId?: string): Promise<Patient | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/patients')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch patient')
      }

      const { patient } = await response.json()
      return patient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getPatientsByTherapist = async (therapistId: string): Promise<Patient[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/patients?therapistId=${therapistId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch patients')
      }

      const { patients } = await response.json()
      return patients || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Therapist methods
  const createTherapist = async (therapistData: {
    firstName: string
    lastName: string
    email: string
    licenseNumber: string
    specialization: string
  }): Promise<Therapist | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/therapists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(therapistData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create therapist')
      }

      const { therapist } = await response.json()
      return therapist
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getTherapist = async (): Promise<Therapist | null> => {
    if (therapistCache.current) return therapistCache.current
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/therapists')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch therapist')
      }
      const { therapist } = await response.json()
      therapistCache.current = therapist
      return therapist
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Exercise methods
  const getAllExercises = async (): Promise<Exercise[]> => {
    if (exercisesCache.current) return exercisesCache.current
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/exercises')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch exercises')
      }
      const { exercises } = await response.json()
  exercisesCache.current = exercises || []
  return exercisesCache.current || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Exercise Assignment methods
  const assignExercise = async (assignmentData: {
    therapistId: string
    patientId: string
    exerciseId: string
    dueDate?: string
    targetReps?: number
    targetSets?: number
    targetDuration?: number
    notes?: string
  }): Promise<ExerciseAssignment | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/exercise-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign exercise')
      }

      const { assignment } = await response.json()
      return assignment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getPatientAssignments = async (patientId: string): Promise<ExerciseAssignment[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/exercise-assignments?patientId=${patientId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch assignments')
      }

      const { assignments } = await response.json()
      return assignments || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return []
    } finally {
      setLoading(false)
    }
  }

  const getTherapistAssignments = async (therapistId: string): Promise<ExerciseAssignment[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/exercise-assignments?therapistId=${therapistId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch assignments')
      }

      const { assignments } = await response.json()
      return assignments || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return []
    } finally {
      setLoading(false)
    }
  }

  const updateAssignmentStatus = async (assignmentId: string, status: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/exercise-assignments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentId, status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update assignment')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Progress methods
  const saveProgress = async (progressData: {
    patientId: string
    exerciseAssignmentId?: string
    exerciseName: string
    duration: number
    accuracy: number
    score: number
    reps?: number
    sets?: number
    feedback: string[]
    videoAnalysisData?: any
  }): Promise<ProgressEntry | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save progress')
      }

      const { progressEntry } = await response.json()
      return progressEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getPatientProgress = async (patientId: string, days: number = 30): Promise<{
    progressEntries: ProgressEntry[]
    analytics: PatientAnalytics
  } | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/progress?patientId=${patientId}&days=${days}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch progress')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Patient assignment methods
  const assignPatientToTherapist = async (therapistId: string, patientId: string, notes?: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/assign-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ therapistId, patientId, notes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign patient')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    // State
    loading,
    error,
    
    // Patient methods
    createPatient,
    getPatient,
    getPatientsByTherapist,
    
    // Therapist methods
    createTherapist,
    getTherapist,
    
    // Exercise methods
    getAllExercises,
    
    // Assignment methods
    assignExercise,
    getPatientAssignments,
    getTherapistAssignments,
    updateAssignmentStatus,
    
    // Progress methods
    saveProgress,
    getPatientProgress,
    
    // Relations
    assignPatientToTherapist,
    
    // Utility
    clearError
  }
}
