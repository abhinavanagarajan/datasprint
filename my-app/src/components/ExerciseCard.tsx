// components/ExerciseCard.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Exercise } from '@/lib/store'
import { Clock, BarChart3, Trophy, Glasses } from 'lucide-react'

interface ExerciseCardProps {
  exercise: Exercise
  showButton?: boolean
}

const ExerciseCard = ({ exercise, showButton = true }: ExerciseCardProps) => {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  }
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
    >
      <div className="h-40 bg-gradient-to-r from-blue-100 to-purple-100 relative">
          <div className="absolute top-3 right-3 flex gap-2 z-10">
          {exercise.vrSupported && (
            <Link
              href={`/patient/exercises/${exercise.id}/vr`}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full p-1.5 shadow-sm hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 hover:scale-110 z-20 relative cursor-pointer"
              title="Start VR Mode"
              onClick={(e) => e.stopPropagation()}
            >
              <Glasses className="h-3 w-3 pointer-events-none" />
            </Link>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
            {exercise.difficulty.toUpperCase()}
          </span>
        </div>
        
        {exercise.completed > 0 && (
          <div className="absolute top-3 left-3 bg-white rounded-full p-1 shadow-md">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-gray-800 text-lg mb-2">{exercise.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <BarChart3 className="h-4 w-4 mr-1" />
            {exercise.sets} sets × {exercise.reps} reps
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {exercise.duration}s
          </div>
        </div>
        
        {showButton && (
          <Link 
            href={`/patient/exercises/${exercise.id}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition-colors font-medium"
          >
            Start Exercise
          </Link>
        )}
      </div>
    </motion.div>
  )
}

export default ExerciseCard