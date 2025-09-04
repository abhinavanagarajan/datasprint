'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Brain, Target, Calendar, Clock } from 'lucide-react'
import InjuryReportUpload from '@/components/InjuryReportUpload'

interface RecommendedExercise {
  name: string
  sets: number
  reps: string
  duration: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

export default function InjuryReportPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendedExercise[]>([])
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setIsAnalyzing(true)
    
    // Simulate AI analysis of the injury report
    setTimeout(() => {
      // Mock recommendations based on common injury types
      const mockRecommendations: RecommendedExercise[] = [
        {
          name: "Gentle Range of Motion",
          sets: 3,
          reps: "10-15 reps",
          duration: "2 weeks",
          description: "Gentle movements to restore mobility and prevent stiffness",
          difficulty: "Beginner"
        },
        {
          name: "Strengthening Exercises",
          sets: 2,
          reps: "8-12 reps",
          duration: "4 weeks",
          description: "Progressive resistance training to rebuild muscle strength",
          difficulty: "Intermediate"
        },
        {
          name: "Balance Training",
          sets: 3,
          reps: "30-60 seconds",
          duration: "3 weeks",
          description: "Stability exercises to improve proprioception and prevent re-injury",
          difficulty: "Beginner"
        },
        {
          name: "Functional Movement",
          sets: 2,
          reps: "10-15 reps",
          duration: "6 weeks",
          description: "Real-world movement patterns to return to daily activities",
          difficulty: "Advanced"
        }
      ]
      
      setRecommendations(mockRecommendations)
      setIsAnalyzing(false)
      setAnalysisComplete(true)
    }, 3000) // 3 second simulation
  }

  const proceedToExercises = () => {
    // Store recommendations in localStorage or state management
    localStorage.setItem('exerciseRecommendations', JSON.stringify(recommendations))
    router.push('/patient/exercises')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-4">
            🏥 INJURY ASSESSMENT
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Upload your medical report to receive personalized exercise recommendations powered by AI
          </p>
        </motion.div>

        {/* Upload Section */}
        {!analysisComplete && (
          <motion.div 
            className="bg-slate-800/50 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <InjuryReportUpload 
              onUpload={handleFileUpload}
              isUploading={isAnalyzing}
            />
          </motion.div>
        )}

        {/* Analysis In Progress */}
        {isAnalyzing && (
          <motion.div 
            className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-6">
              <div className="relative">
                <Brain className="w-16 h-16 mx-auto text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-cyan-300 mb-2">AI Analysis in Progress</h3>
                <p className="text-blue-200">
                  Our advanced AI is analyzing your injury report to create personalized recommendations...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {analysisComplete && recommendations.length > 0 && (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Results Header */}
            <div className="bg-gradient-to-r from-green-900/50 to-cyan-900/50 backdrop-blur-xl border border-green-400/30 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <h2 className="text-2xl font-bold text-green-300">Analysis Complete!</h2>
                  <p className="text-green-200">Here's your personalized rehabilitation plan:</p>
                </div>
              </div>
            </div>

            {/* Exercise Recommendations */}
            <div className="grid gap-6">
              {recommendations.map((exercise, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-cyan-300 mb-2">{exercise.name}</h3>
                      <p className="text-blue-200 mb-4">{exercise.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exercise.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                      exercise.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                      <Target className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-sm text-gray-400">Sets</p>
                        <p className="font-semibold text-white">{exercise.sets}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                      <ArrowRight className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-sm text-gray-400">Reps</p>
                        <p className="font-semibold text-white">{exercise.reps}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-sm text-gray-400">Duration</p>
                        <p className="font-semibold text-white">{exercise.duration}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Continue Button */}
            <motion.div 
              className="text-center pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <button
                onClick={proceedToExercises}
                className="group relative px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
              >
                <span className="flex items-center space-x-3">
                  <span>Start My Exercise Program</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <p className="text-sm text-gray-400 mt-3">
                Your personalized exercises are ready to begin
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div 
          className="mt-12 p-6 bg-slate-800/30 border border-slate-600/30 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-cyan-300 mb-3">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-200">
            <p>• Upload a clear PDF of your medical report or X-ray results</p>
            <p>• Include any doctor's notes or physiotherapy recommendations</p>
            <p>• Our AI will analyze your condition and create a custom plan</p>
            <p>• You can always update your report as your condition improves</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
