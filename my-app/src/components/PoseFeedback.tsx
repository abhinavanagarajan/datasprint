// components/PoseFeedback.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const PoseFeedback = () => {
  const [feedback, setFeedback] = useState<string>('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [counter, setCounter] = useState(0)
  
  // Simulate pose detection feedback
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random()
      
      if (random > 0.7) {
        setFeedback('Perfect form! Keep it up!')
        setIsCorrect(true)
        setCounter(prev => prev + 1)
      } else if (random > 0.4) {
        setFeedback('Adjust your posture slightly')
        setIsCorrect(null)
      } else {
        setFeedback('Incorrect position. Please check the instructions.')
        setIsCorrect(false)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-4 aspect-video flex items-center justify-center relative">
        <div className="text-white text-center">
          <div className="text-lg font-semibold mb-2">Camera Feed</div>
          <div className="text-sm text-gray-400">Pose detection will appear here</div>
        </div>
        
        <div className="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-lg">
          <div className="text-center">
            <div className="text-xs text-gray-500">Reps</div>
            <div className="text-2xl font-bold text-blue-600">{counter}</div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              isCorrect === true ? 'bg-green-100 text-green-800' :
              isCorrect === false ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}
          >
            {isCorrect === true ? (
              <CheckCircle className="h-6 w-6" />
            ) : isCorrect === false ? (
              <XCircle className="h-6 w-6" />
            ) : (
              <AlertCircle className="h-6 w-6" />
            )}
            <span className="font-medium">{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PoseFeedback