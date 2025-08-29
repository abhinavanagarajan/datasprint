// app/patient/exercises/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import PoseFeedback from '@/components/PoseFeedback'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle, Play, Pause, RotateCcw } from 'lucide-react'

export default function ExerciseExecution() {
  const params = useParams()
  const { exercises, completeExercise } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  
  const exercise = exercises.find(ex => ex.id === params.id)
  
  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Exercise not found</h1>
          <p className="text-gray-600 mt-2">The exercise you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }
  
  const handleComplete = () => {
    // Simulate accuracy between 70-100%
    const accuracy = Math.floor(Math.random() * 31) + 70
    completeExercise(exercise.id, accuracy)
    setShowCompletion(true)
    
    // Hide completion after 3 seconds
    setTimeout(() => {
      setShowCompletion(false)
    }, 3000)
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">{exercise.title}</h1>
        <p className="text-gray-600 mt-2">{exercise.description}</p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video and feedback section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PoseFeedback />
        </motion.div>
        
        {/* Instructions and controls section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">Step {currentStep + 1} of {exercise.instructions.length}</div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="p-2 bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setIsPlaying(prev => !prev)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button 
                  onClick={() => setCurrentStep(prev => Math.min(exercise.instructions.length - 1, prev + 1))}
                  disabled={currentStep === exercise.instructions.length - 1}
                  className="p-2 bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <RotateCcw className="h-5 w-5 transform rotate-180" />
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-blue-800">{exercise.instructions[currentStep]}</p>
            </div>
            
            <div className="flex space-x-2 mb-2">
              {exercise.instructions.map((_, index) => (
                <div 
                  key={index}
                  className={`h-2 flex-1 rounded-full ${index === currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-500">Sets</div>
              <div className="text-lg font-semibold">{exercise.sets}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-500">Reps</div>
              <div className="text-lg font-semibold">{exercise.reps}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-lg font-semibold">{exercise.duration}s</div>
            </div>
          </div>
          
          <button 
            onClick={handleComplete}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Complete Exercise
          </button>
        </motion.div>
      </div>
      
      {/* Completion Overlay */}
      {showCompletion && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-xl text-center max-w-md"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Exercise Completed!</h3>
            <p className="text-gray-600 mb-4">Great job completing {exercise.title}!</p>
            <button 
              onClick={() => setShowCompletion(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}