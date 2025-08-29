// app/patient/exercises/page.tsx
'use client'

import { useStore } from '@/lib/store'
import ExerciseCard from '@/components/ExerciseCard'
import { motion } from 'framer-motion'

export default function PatientExercises() {
  const { exercises } = useStore()
  
  const completedExercises = exercises.filter(ex => ex.completed > 0)
  const pendingExercises = exercises.filter(ex => ex.completed === 0)
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Your Exercises
      </motion.h1>
      
      {pendingExercises.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Exercises to Complete</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingExercises.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </motion.div>
      )}
      
      {completedExercises.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Completed Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedExercises.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} showButton={false} />
            ))}
          </div>
        </motion.div>
      )}
      
      {exercises.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center shadow-md">
          <div className="text-gray-400 mb-4">No exercises assigned yet</div>
          <p className="text-gray-600">Your therapist will assign exercises for you soon.</p>
        </div>
      )}
    </div>
  )
}