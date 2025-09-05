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
  vrSupported?: boolean // New VR support flag
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
    thumbnail: '/exercises/arm-curl.png',
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
    thumbnail: '/exercises/shoulder-press.png',
    instructions: [
      'Sit or stand with weights at shoulder level',
      'Press weights upward until arms are fully extended',
      'Slowly lower back to starting position'
    ]
  },
  {
    id: '3',
    title: 'Shoulder Raise',
    description: 'Raise both arms overhead to improve shoulder mobility and strength',
    difficulty: 'medium',
    reps: 10,
    sets: 3,
    duration: 40,
    completed: 0,
    thumbnail: '/exercises/shoulder-raise.png',
    vrSupported: true, // VR available
    instructions: [
      'Stand with feet shoulder-width apart',
      'Raise both arms straight overhead until fully extended',
      'Keep shoulders level and avoid leaning',
      'Lower arms slowly back to the starting position'
    ]
  },
  {
    id: '4',
    title: 'Left Arm Raise',
    description: 'Raise your left arm to shoulder height or above while keeping posture aligned',
    difficulty: 'easy',
    reps: 12,
    sets: 3,
    duration: 30,
    completed: 0,
    thumbnail: '/exercises/left-arm-raise.png',
    instructions: [
      'Stand upright with arms relaxed at your sides',
      'Lift your left arm straight out to the side until shoulder height or above',
      'Keep shoulders level, avoid leaning',
      'Right arm should remain relaxed at your side',
      'Slowly return to the starting position'
    ]
  },
  {
    id: '5',
    title: 'Right Arm Raise',
    description: 'Raise your right arm to shoulder height or above while keeping posture aligned',
    difficulty: 'easy',
    reps: 12,
    sets: 3,
    duration: 30,
    completed: 0,
    thumbnail: '/exercises/right-arm-raise.png',
    instructions: [
      'Stand upright with arms relaxed at your sides',
      'Lift your right arm straight out to the side until shoulder height or above',
      'Keep shoulders level, avoid leaning',
      'Left arm should remain relaxed at your side',
      'Slowly return to the starting position'
    ]
  },
  {
    id: '6',
    title: 'Squat',
    description: 'Perform squats to strengthen the legs and maintain back posture',
    difficulty: 'hard',
    reps: 15,
    sets: 4,
    duration: 60,
    completed: 0,
    thumbnail: '/exercises/squat.png',
    vrSupported: true, // VR available
    instructions: [
      'Stand with feet shoulder-width apart',
      'Bend knees to lower your body until thighs are parallel to the ground',
      'Keep knees aligned with toes and back straight',
      'Push back up through your heels to return to standing position'
    ]
  },
  {
    id: '7',
    title: 'Arm Stretch',
    description: 'Extend both arms outward to improve flexibility and posture',
    difficulty: 'easy',
    reps: 8,
    sets: 2,
    duration: 20,
    completed: 0,
    thumbnail: '/exercises/arm-stretch.png',
    instructions: [
      'Stand upright with arms by your sides',
      'Raise both arms outward until they are perpendicular to your body',
      'Keep arms straight and extended',
      'Hold for a few seconds, then relax'
    ]
  },
  {
    id: '8',
    title: 'Standing Balance',
    description: 'Maintain upright posture to strengthen balance and stability',
    difficulty: 'medium',
    reps: 5,
    sets: 2,
    duration: 60,
    completed: 0,
    thumbnail: '/exercises/standing-balance.png',
    instructions: [
      'Stand upright with feet hip-width apart',
      'Keep shoulders level and aligned with hips',
      'Maintain posture without leaning for the set duration',
      'Focus forward to stabilize balance'
    ]
  },
  {
    id: '9',
    title: 'Neck Rotation',
    description: 'Rotate neck gently to improve flexibility and reduce stiffness',
    difficulty: 'easy',
    reps: 10,
    sets: 2,
    duration: 30,
    completed: 0,
    thumbnail: '/exercises/neck-rotation.png',
    instructions: [
      'Sit or stand upright',
      'Slowly rotate head to the left until aligned with shoulder',
      'Return to center and rotate to the right',
      'Keep shoulders stable throughout movement'
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