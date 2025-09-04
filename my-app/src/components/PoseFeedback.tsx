// components/PoseFeedback.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface PoseFeedbackProps {
  "success": boolean,
  "score": number,
  "is_correct": boolean,
  "exercise_name": string,
  "feedback_messages": string[],
  "audio_feedback": string,
  "annotated_frame": string,
  "individual_scores": number[],
  "landmarks": number[]
}

const PoseFeedback: React.FC<PoseFeedbackProps> = ({ success, score, is_correct, exercise_name, feedback_messages, audio_feedback, annotated_frame, individual_scores }) => {

  
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-4 aspect-video flex items-center justify-center relative">
        <div className="text-white text-center">
          <div className="rounded-full mt-5">
            {annotated_frame ? (
              <img src={annotated_frame} alt="From hook" className="w-full h-full object-cover rounded" />
            ) : (
              <p>No image yet</p>
            )}
            </div>
        </div>
        
        <div className="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-lg">
          <div className="text-center">
            <div className="text-xs text-gray-500"></div>
            <div className="text-2xl font-bold text-blue-600">
              {is_correct === true
                ? <CheckCircle className="h-6 w-6" />
                : is_correct === false
                ? <XCircle className="h-6 w-6" />
                : ""}
            </div>

          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {feedback_messages && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              is_correct === true ? 'bg-green-100 text-green-800' :
              is_correct === false ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}
          >
            {is_correct === true ? (
              <CheckCircle className="h-6 w-6" />
            ) : is_correct === false ? (
              <XCircle className="h-6 w-6" />
            ) : (
              <AlertCircle className="h-6 w-6" />
            )}
             <div className="flex flex-col space-y-1">
              {feedback_messages.map((feedback, index) => (
                <span key={index} className="font-medium">{feedback}<hr/></span>
                
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PoseFeedback