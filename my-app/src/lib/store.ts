 // lib/store.ts
import { create } from 'zustand'

export interface Exercise {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  reps: number
  sets: number
  duration: number
  completed: number
  thumbnail: string
  instructions: string[]
}

export interface ProgressData {
  date: string
  completed: number
  timeSpent: number
  accuracy: number
}

export interface Patient {
  id: string
  name: string
  email: string
  assignedExercises: Exercise[]
  progress: ProgressData[]
  lastActivity?: string
  streak: number
}

interface AppState {
  // Patient state
  exercises: Exercise[]
  progress: ProgressData[]
  streak: number
  
  // Therapist state
  patients: Patient[]
  selectedPatient: Patient | null
  
  // Actions
  setExercises: (exercises: Exercise[]) => void
  setProgress: (progress: ProgressData[]) => void
  updateStreak: (streak: number) => void
  setPatients: (patients: Patient[]) => void
  setSelectedPatient: (patient: Patient | null) => void
  completeExercise: (exerciseId: string, accuracy: number) => void
}

// Dummy data for initial state
const dummyExercises: Exercise[] = [
  {
    id: '1',
    title: 'Arm Curls',
    description: 'Curl your arm with weights to strengthen biceps',
    difficulty: 'easy',
    reps: 10,
    sets: 3,
    duration: 30,
    completed: 0,
    thumbnail: '/exercises/arm-curl.jpg',
    instructions: [
      'Hold weights in both hands',
      'Keep elbows close to your body',
      'Curl weights up toward shoulders',
      'Slowly lower back down'
    ]
  },
  {
    id: '2',
    title: 'Shoulder Press',
    description: 'Press weights overhead to strengthen shoulders',
    difficulty: 'medium',
    reps: 12,
    sets: 3,
    duration: 45,
    completed: 0,
    thumbnail: '/exercises/shoulder-press.jpg',
    instructions: [
      'Sit or stand with weights at shoulder level',
      'Press weights upward until arms are fully extended',
      'Slowly lower back to starting position'
    ]
  }
]

const dummyProgress: ProgressData[] = [
  { date: '2024-05-01', completed: 5, timeSpent: 30, accuracy: 80 },
  { date: '2024-05-02', completed: 7, timeSpent: 45, accuracy: 85 },
  { date: '2024-05-03', completed: 6, timeSpent: 40, accuracy: 75 },
  { date: '2024-05-04', completed: 8, timeSpent: 50, accuracy: 90 },
  { date: '2024-05-05', completed: 4, timeSpent: 25, accuracy: 70 },
]

const dummyPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    assignedExercises: dummyExercises,
    progress: dummyProgress,
    lastActivity: '2024-05-05',
    streak: 5
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    assignedExercises: dummyExercises,
    progress: dummyProgress,
    lastActivity: '2024-05-04',
    streak: 3
  }
]

export const useStore = create<AppState>((set) => ({
  // Initial state
  exercises: dummyExercises,
  progress: dummyProgress,
  streak: 5,
  patients: dummyPatients,
  selectedPatient: null,
  
  // Actions
  setExercises: (exercises) => set({ exercises }),
  setProgress: (progress) => set({ progress }),
  updateStreak: (streak) => set({ streak }),
  setPatients: (patients) => set({ patients }),
  setSelectedPatient: (selectedPatient) => set({ selectedPatient }),
  completeExercise: (exerciseId, accuracy) => 
    set((state) => {
      const updatedExercises = state.exercises.map(exercise => 
        exercise.id === exerciseId 
          ? { ...exercise, completed: exercise.completed + 1 }
          : exercise
      )
      
      const today = new Date().toISOString().split('T')[0]
      const existingProgressIndex = state.progress.findIndex(p => p.date === today)
      
      const updatedProgress = [...state.progress]
      
      if (existingProgressIndex >= 0) {
        updatedProgress[existingProgressIndex] = {
          ...updatedProgress[existingProgressIndex],
          completed: updatedProgress[existingProgressIndex].completed + 1,
          timeSpent: updatedProgress[existingProgressIndex].timeSpent + 10,
          accuracy: Math.round((updatedProgress[existingProgressIndex].accuracy + accuracy) / 2)
        }
      } else {
        updatedProgress.push({
          date: today,
          completed: 1,
          timeSpent: 10,
          accuracy: accuracy
        })
      }
      
      return { 
        exercises: updatedExercises, 
        progress: updatedProgress,
        streak: state.streak + 1
      }
    })
}))