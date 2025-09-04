'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Brain, Target, Calendar, Clock, FileText, Sparkles, Heart, Award } from 'lucide-react'
import InjuryReportUpload from '@/components/InjuryReportUpload'

interface RecommendedExercise {
  name: string
  sets: number
  reps: number
  duration: number
  confidence: number
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
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      
      // Call the backend API
      const response = await fetch('http://127.0.0.1:8000/process_report', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to process report')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Transform API response to match our interface
        const transformedRecommendations: RecommendedExercise[] = data.result.recommended_exercises.map((exercise: any) => ({
          name: exercise.name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
          sets: exercise.sets,
          reps: exercise.reps,
          duration: exercise.duration,
          confidence: exercise.confidence
        }))
        
        setRecommendations(transformedRecommendations)
        setAnalysisComplete(true)
      } else {
        throw new Error('Analysis failed')
      }
    } catch (error) {
      console.error('Error processing report:', error)
      // You might want to show an error message to the user here
      alert('Failed to process the report. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const proceedToExercises = () => {
    // Store recommendations in localStorage or state management
    localStorage.setItem('exerciseRecommendations', JSON.stringify(recommendations))
    router.push('/patient/exercises')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-3xl mb-6 shadow-xl">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent mb-6">
            Injury Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload your medical report and let our AI create a personalized recovery plan designed specifically for your needs
          </p>
        </motion.div>

        {/* Upload Section */}
        {!analysisComplete && (
          <motion.div 
            className="group relative mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-orange-400 rounded-3xl blur-lg opacity-20 group-hover:opacity-25 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-10 shadow-xl">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-rose-100 to-orange-100 rounded-2xl">
                  <FileText className="h-8 w-8 text-rose-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Upload Your Medical Report</h2>
              <p className="text-gray-600 text-center mb-8">Drag and drop your file or click to browse</p>
              <InjuryReportUpload 
                onUpload={handleFileUpload}
                isUploading={isAnalyzing}
              />
            </div>
          </motion.div>
        )}

        {/* Analysis In Progress */}
        {isAnalyzing && (
          <motion.div 
            className="group relative mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-lg opacity-15 animate-pulse"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-white/60 rounded-3xl p-12 shadow-xl">
              <div className="text-center space-y-8">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <Brain className="w-10 h-10 text-blue-600 animate-pulse" />
                  </div>
                  <div className="absolute -inset-3 border-4 border-blue-300/30 rounded-3xl animate-ping"></div>
                  <div className="absolute -inset-1 border-2 border-blue-400/40 rounded-2xl animate-spin"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-800">AI Analysis in Progress</h3>
                  <p className="text-lg text-gray-600 max-w-md mx-auto">
                    Our intelligent system is carefully analyzing your medical report to create the perfect recovery plan
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {analysisComplete && recommendations.length > 0 && (
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Results Header */}
            <motion.div 
              className="group relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white/90 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-center space-x-6">
                  <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Analysis Complete!</h2>
                    <p className="text-lg text-gray-600">Your personalized rehabilitation plan is ready</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                    <Award className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Exercise Recommendations */}
            <div className="grid gap-8">
              {recommendations.map((exercise, index) => (
                <motion.div
                  key={index}
                  className="group relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="absolute inset-0 rounded-3xl blur-lg opacity-15 transition duration-300 group-hover:opacity-20 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
                            <Target className="w-6 h-6 text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800">{exercise.name}</h3>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          AI-recommended exercise with {(exercise.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                      <div className="px-4 py-2 rounded-full text-sm font-semibold border-2 bg-blue-50 text-blue-700 border-blue-200">
                        {(exercise.confidence * 100).toFixed(0)}% Match
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-4 p-5 bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-2xl border border-gray-100">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Sets</p>
                          <p className="text-xl font-bold text-gray-800">{exercise.sets}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-5 bg-gradient-to-br from-gray-50 to-purple-50/50 rounded-2xl border border-gray-100">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <ArrowRight className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Repetitions</p>
                          <p className="text-xl font-bold text-gray-800">{exercise.reps}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-5 bg-gradient-to-br from-gray-50 to-green-50/50 rounded-2xl border border-gray-100">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Duration (sec)</p>
                          <p className="text-xl font-bold text-gray-800">{exercise.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Continue Button */}
            <motion.div 
              className="text-center pt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-orange-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <button
                  onClick={proceedToExercises}
                  className="group relative px-12 py-5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-lg rounded-full hover:from-rose-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-rose-500/25"
                >
                  <span className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5" />
                    <span>Start My Recovery Journey</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
              <p className="text-gray-500 mt-4 text-lg">
                Your personalized exercise program awaits
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div 
          className="mt-16 group relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 rounded-3xl blur-lg opacity-10"></div>
          <div className="relative bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Need Help?</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Upload a clear PDF of your medical report or X-ray results</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Include any doctor's notes or physiotherapy recommendations</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Our AI will analyze your condition and create a custom plan</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>You can always update your report as your condition improves</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}