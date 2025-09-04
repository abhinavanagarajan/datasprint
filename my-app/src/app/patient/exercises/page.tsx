// app/patient/exercises/page.tsx
'use client'

import { useStore } from '@/lib/store'
import ExerciseCard from '@/components/ExerciseCard'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Brain, AlertCircle } from 'lucide-react'

interface RecommendedExercise {
  name: string
  sets: number
  reps: number
  duration: number
  confidence: number
}

export default function PatientExercises() {
  const { exercises } = useStore()
  const [recommendations, setRecommendations] = useState<RecommendedExercise[]>([])
  const [hasReport, setHasReport] = useState(false)
  
  useEffect(() => {
    // Check if user has uploaded injury report and has recommendations
    const storedRecommendations = localStorage.getItem('exerciseRecommendations')
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations))
      setHasReport(true)
    }
  }, [])
  
  const completedExercises = exercises.filter(ex => ex.completed > 0)
  const pendingExercises = exercises.filter(ex => ex.completed === 0)
  
  // If no injury report uploaded, show upload prompt
  if (!hasReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-4">
                🎮 EXERCISE PORTAL
              </h1>
              <p className="text-xl text-blue-200">
                Upload your injury report first to get personalized exercises
              </p>
            </div>

            {/* Upload Prompt */}
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-cyan-500/20 border-2 border-cyan-400">
                <FileText className="w-10 h-10 text-cyan-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">
                Injury Report Required
              </h2>
              
              <p className="text-blue-200 mb-8 leading-relaxed">
                To provide you with the most effective and safe rehabilitation program, we need to analyze your medical condition first. Upload your injury report to get AI-powered exercise recommendations tailored specifically for your recovery.
              </p>
              
              <Link 
                href="/patient/injury-report"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
              >
                <Brain className="w-5 h-5" />
                <span>Upload Injury Report</span>
              </Link>
            </motion.div>

            {/* Benefits */}
            <motion.div 
              className="grid md:grid-cols-3 gap-6 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                {
                  icon: "🎯",
                  title: "Personalized Plan",
                  description: "Exercises tailored to your specific injury and recovery stage"
                },
                {
                  icon: "🔬",
                  title: "AI Analysis",
                  description: "Advanced algorithms analyze your condition for optimal results"
                },
                {
                  icon: "📈",
                  title: "Progress Tracking",
                  description: "Monitor your improvement with detailed analytics"
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h3 className="text-lg font-bold text-cyan-300 mb-2">{benefit.title}</h3>
                  <p className="text-blue-200 text-sm">{benefit.description}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-2">
              🎮 YOUR EXERCISE PROGRAM
            </h1>
            <p className="text-blue-200">Personalized rehabilitation based on your injury report</p>
          </div>
          
          <Link 
            href="/patient/injury-report"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 border border-cyan-400/30 rounded-lg text-cyan-300 hover:bg-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Update Report</span>
          </Link>
        </motion.div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-cyan-300">AI Recommended Exercises</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((exercise, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-cyan-300">{exercise.name}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                      {(exercise.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  
                  <p className="text-blue-200 mb-4 text-sm">AI-recommended exercise based on your injury report</p>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Sets</p>
                      <p className="font-bold text-white">{exercise.sets}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Reps</p>
                      <p className="font-bold text-white">{exercise.reps}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Duration</p>
                      <p className="font-bold text-white">{exercise.duration}s</p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/patient/exercises/${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="mt-4 w-full block text-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Start Exercise
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Therapist Assigned Exercises */}
        {pendingExercises.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold text-cyan-300 mb-6">Therapist Assigned Exercises</h2>
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
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-green-400 mb-6">✅ Completed Exercises</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedExercises.map(exercise => (
                <ExerciseCard key={exercise.id} exercise={exercise} showButton={false} />
              ))}
            </div>
          </motion.div>
        )}
        
        {exercises.length === 0 && recommendations.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <div className="text-yellow-300 mb-4 text-lg font-semibold">No exercises available</div>
            <p className="text-blue-200">Upload your injury report to get AI recommendations, or wait for your therapist to assign exercises.</p>
          </div>
        )}
      </div>
    </div>
  )
}