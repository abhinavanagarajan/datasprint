// lib/database.ts - Database schema and types

export interface Patient {
  id: string
  userId: string // Clerk user ID
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

export interface Therapist {
  id: string
  userId: string // Clerk user ID
  firstName: string
  lastName: string
  email: string
  licenseNumber: string
  specialization: string
  createdAt: string
  updatedAt: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  instructions: string[]
  targetBodyParts: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  imageUrl?: string
  videoUrl?: string
  createdAt: string
}

export interface ExerciseAssignment {
  id: string
  therapistId: string
  patientId: string
  exerciseId: string
  assignedDate: string
  dueDate?: string
  targetReps?: number
  targetSets?: number
  targetDuration?: number // in minutes
  notes?: string
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped'
  createdAt: string
  updatedAt: string
}

export interface ProgressEntry {
  id: string
  patientId: string
  exerciseAssignmentId?: string
  date: string
  exerciseName: string
  duration: number // in seconds
  accuracy: number // 0-100
  score: number // 0-1
  reps?: number
  sets?: number
  feedback: string[]
  videoAnalysisData?: {
    individual_scores: Record<string, number>
    pose_landmarks: any[]
    exercise_specific_feedback: string[]
  }
  createdAt: string
}

export interface TherapistPatientRelation {
  id: string
  therapistId: string
  patientId: string
  assignedDate: string
  status: 'active' | 'inactive' | 'transferred'
  notes?: string
  createdAt: string
  updatedAt: string
}

// Mock database - In production, replace with actual database
class MockDatabase {
  private patients: Patient[] = []
  private therapists: Therapist[] = []
  private exercises: Exercise[] = []
  private exerciseAssignments: ExerciseAssignment[] = []
  private progressEntries: ProgressEntry[] = []
  private therapistPatientRelations: TherapistPatientRelation[] = []

  constructor() {
    this.initializeDefaultData()
  }

  private initializeDefaultData() {
    // Default exercises
    this.exercises = [
      {
        id: 'ex1',
        name: 'Shoulder Press',
        description: 'Overhead shoulder strengthening exercise',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Hold weights at shoulder level',
          'Press weights overhead until arms are fully extended',
          'Lower weights back to starting position'
        ],
        targetBodyParts: ['shoulders', 'arms'],
        difficulty: 'beginner',
        duration: 10,
        imageUrl: '/exercises/shoulder-press.png',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ex2',
        name: 'Arm Curl',
        description: 'Bicep strengthening exercise',
        instructions: [
          'Stand with feet hip-width apart',
          'Hold weights with arms at your sides',
          'Curl weights toward shoulders',
          'Lower weights slowly back to starting position'
        ],
        targetBodyParts: ['arms', 'biceps'],
        difficulty: 'beginner',
        duration: 8,
        imageUrl: '/exercises/arm-curl.png',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ex3',
        name: 'Knee Raises',
        description: 'Lower body strengthening and mobility',
        instructions: [
          'Stand with feet hip-width apart',
          'Lift one knee toward chest',
          'Hold for 2 seconds',
          'Lower leg and repeat with other side'
        ],
        targetBodyParts: ['legs', 'core'],
        difficulty: 'beginner',
        duration: 5,
        createdAt: new Date().toISOString()
      }
    ]
  }

  // Patient methods
  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.patients.push(newPatient)
    return newPatient
  }

  async getPatientByUserId(userId: string): Promise<Patient | null> {
    return this.patients.find(p => p.userId === userId) || null
  }

  async getPatientsByTherapistId(therapistId: string): Promise<Patient[]> {
    const relations = this.therapistPatientRelations.filter(r => r.therapistId === therapistId && r.status === 'active')
    return this.patients.filter(p => relations.some(r => r.patientId === p.id))
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const index = this.patients.findIndex(p => p.id === id)
    if (index === -1) return null
    
    this.patients[index] = {
      ...this.patients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.patients[index]
  }

  // Therapist methods
  async createTherapist(therapist: Omit<Therapist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Therapist> {
    const newTherapist: Therapist = {
      ...therapist,
      id: `therapist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.therapists.push(newTherapist)
    return newTherapist
  }

  async getTherapistByUserId(userId: string): Promise<Therapist | null> {
    return this.therapists.find(t => t.userId === userId) || null
  }

  // Exercise methods
  async getAllExercises(): Promise<Exercise[]> {
    return [...this.exercises]
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    return this.exercises.find(e => e.id === id) || null
  }

  // Exercise Assignment methods
  async createExerciseAssignment(assignment: Omit<ExerciseAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExerciseAssignment> {
    const newAssignment: ExerciseAssignment = {
      ...assignment,
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.exerciseAssignments.push(newAssignment)
    return newAssignment
  }

  async getExerciseAssignmentsByPatientId(patientId: string): Promise<ExerciseAssignment[]> {
    return this.exerciseAssignments.filter(a => a.patientId === patientId)
  }

  async getExerciseAssignmentsByTherapistId(therapistId: string): Promise<ExerciseAssignment[]> {
    return this.exerciseAssignments.filter(a => a.therapistId === therapistId)
  }

  async updateExerciseAssignment(id: string, updates: Partial<ExerciseAssignment>): Promise<ExerciseAssignment | null> {
    const index = this.exerciseAssignments.findIndex(a => a.id === id)
    if (index === -1) return null
    
    this.exerciseAssignments[index] = {
      ...this.exerciseAssignments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.exerciseAssignments[index]
  }

  // Progress Entry methods
  async createProgressEntry(entry: Omit<ProgressEntry, 'id' | 'createdAt'>): Promise<ProgressEntry> {
    const newEntry: ProgressEntry = {
      ...entry,
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    this.progressEntries.push(newEntry)
    return newEntry
  }

  async getProgressEntriesByPatientId(patientId: string): Promise<ProgressEntry[]> {
    return this.progressEntries.filter(p => p.patientId === patientId)
  }

  async getProgressEntriesByDateRange(patientId: string, startDate: string, endDate: string): Promise<ProgressEntry[]> {
    return this.progressEntries.filter(p => 
      p.patientId === patientId && 
      p.date >= startDate && 
      p.date <= endDate
    )
  }

  // Therapist-Patient Relation methods
  async assignPatientToTherapist(therapistId: string, patientId: string, notes?: string): Promise<TherapistPatientRelation> {
    // Deactivate any existing active relations for this patient
    this.therapistPatientRelations.forEach(r => {
      if (r.patientId === patientId && r.status === 'active') {
        r.status = 'inactive'
        r.updatedAt = new Date().toISOString()
      }
    })

    const newRelation: TherapistPatientRelation = {
      id: `relation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      therapistId,
      patientId,
      assignedDate: new Date().toISOString(),
      status: 'active',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.therapistPatientRelations.push(newRelation)
    
    // Update patient's therapistId
    await this.updatePatient(patientId, { therapistId })
    
    return newRelation
  }

  // Analytics methods
  async getPatientAnalytics(patientId: string, days: number = 30): Promise<{
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
  }> {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const entries = await this.getProgressEntriesByDateRange(patientId, startDate, endDate)
    
    const totalExercises = entries.length
    const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0)
    const averageAccuracy = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.accuracy, 0) / entries.length 
      : 0
    
    const exerciseFrequency: Record<string, number> = {}
    entries.forEach(entry => {
      exerciseFrequency[entry.exerciseName] = (exerciseFrequency[entry.exerciseName] || 0) + 1
    })
    
    // Calculate weekly progress
    const weeklyProgress: Array<{
      week: string
      exercises: number
      accuracy: number
      time: number
    }> = []
    
    const weeksToShow = Math.ceil(days / 7)
    for (let i = 0; i < weeksToShow; i++) {
      const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)
      
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= weekStart && entryDate < weekEnd
      })
      
      weeklyProgress.unshift({
        week: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        exercises: weekEntries.length,
        accuracy: weekEntries.length > 0 
          ? weekEntries.reduce((sum, entry) => sum + entry.accuracy, 0) / weekEntries.length 
          : 0,
        time: weekEntries.reduce((sum, entry) => sum + entry.duration, 0)
      })
    }
    
    return {
      totalExercises,
      totalTime,
      averageAccuracy,
      exerciseFrequency,
      weeklyProgress
    }
  }
}

// Singleton instance
export const db = new MockDatabase()

// Utility functions
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export const getDateRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  return { startDate, endDate }
}
