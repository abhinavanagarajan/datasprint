// app/patient/dashboard/page.tsx
'use client'

import { useStore } from '@/lib/store'
import ExerciseCard from '@/components/ExerciseCard'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Target, Calendar, Award, Sparkles, ChevronRight, FileText, Brain, Upload, ArrowRight } from 'lucide-react'

export default function PatientDashboard() {
  const { exercises, progress, streak } = useStore()
  const [hasInjuryReport, setHasInjuryReport] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  
  useEffect(() => {
    // Check if user has uploaded injury report
    const storedRecommendations = localStorage.getItem('exerciseRecommendations')
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations))
      setHasInjuryReport(true)
    }
  }, [])
  
  const completedExercises = exercises.filter(ex => ex.completed > 0).length
  const totalExercises = exercises.length + recommendations.length
  const completionRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
  
  const todayProgress = progress.find(p => p.date === new Date().toISOString().split('T')[0])
  
  const stats = [
    {
      icon: TrendingUp,
      label: 'Completion Rate',
      value: `${completionRate}%`,
      color: 'from-cyan-500 to-blue-600',
      bgGlow: 'shadow-cyan-500/25',
      delay: 0.1
    },
    {
      icon: Target,
      label: "Today's Progress",
      value: todayProgress?.completed || 0,
      color: 'from-emerald-500 to-green-600',
      bgGlow: 'shadow-emerald-500/25',
      delay: 0.2
    },
    {
      icon: Calendar,
      label: 'Current Streak',
      value: `${streak} days`,
      color: 'from-amber-500 to-orange-600',
      bgGlow: 'shadow-amber-500/25',
      delay: 0.3
    },
    {
      icon: Award,
      label: 'Total Exercises',
      value: totalExercises,
      color: 'from-purple-500 to-indigo-600',
      bgGlow: 'shadow-purple-500/25',
      delay: 0.4
    }
  ]

  // If no injury report, show injury report upload prompt
  if (!hasInjuryReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center bg-cyan-500/10 backdrop-blur-sm px-6 py-3 rounded-full border border-cyan-400/30 mb-6">
              <Sparkles className="h-5 w-5 text-cyan-400 mr-2" />
              <span className="text-sm font-medium text-cyan-300">Welcome to your rehabilitation journey</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 mb-6">
              🏥 PATIENT DASHBOARD
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Start your personalized rehabilitation journey with AI-powered exercise recommendations
            </p>
          </motion.div>

          {/* Injury Report Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {/* Main Upload Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-12 mb-12">
              <div className="text-center space-y-8">
                {/* Icon */}
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/50 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-cyan-400" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-cyan-400/20 animate-ping"></div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-cyan-300">
                    Upload Your Injury Report
                  </h2>
                  <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                    Get started by uploading your medical report or injury documentation. 
                    Our AI will analyze your condition and create a personalized exercise program just for you.
                  </p>
                </div>

                {/* Upload Button */}
                <Link 
                  href="/patient/injury-report"
                  className="group inline-flex items-center space-x-4 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                >
                  <Upload className="w-6 h-6" />
                  <span>Upload Injury Report</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Process Steps */}
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {[
                {
                  step: "1",
                  icon: FileText,
                  title: "Upload Report",
                  description: "Upload your medical report, X-rays, or doctor's notes in PDF format"
                },
                {
                  step: "2", 
                  icon: Brain,
                  title: "AI Analysis",
                  description: "Our advanced AI analyzes your condition and determines the best exercises"
                },
                {
                  step: "3",
                  icon: Target,
                  title: "Start Training",
                  description: "Begin your personalized exercise program with sets, reps, and duration"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center space-y-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (index * 0.2) }}
                >
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-700/50 border-2 border-cyan-400/30 flex items-center justify-center">
                      <item.icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-300">{item.title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Help Section */}
            <motion.div 
              className="mt-16 p-8 bg-slate-800/30 border border-slate-600/30 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <h3 className="text-xl font-bold text-cyan-300 mb-4 text-center">What documents can I upload?</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-200">
                <div className="space-y-2">
                  <p>✅ Medical reports and diagnoses</p>
                  <p>✅ X-ray and MRI results</p>
                  <p>✅ Doctor's notes and recommendations</p>
                </div>
                <div className="space-y-2">
                  <p>✅ Physiotherapy assessments</p>
                  <p>✅ Surgery reports and discharge notes</p>
                  <p>✅ Any injury-related documentation</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }
  
  // Dashboard for users who have uploaded injury report
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
            <Sparkles className="h-4 w-4 text-indigo-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Welcome back</span>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r py-4 from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
            Your Progress Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your therapeutic exercises and celebrate every milestone
          </p>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: stat.delay,
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
              whileHover={{ 
                y: -8,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className={`relative bg-white/80 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-xl ${stat.bgGlow} group-hover:shadow-2xl transition-all duration-300`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.label}</p>
                    <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/patient/exercises" className="group">
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Start Exercises</h3>
                    <p className="text-gray-600 text-sm">Begin your AI-recommended workout</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/patient/progress" className="group">
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">View Progress</h3>
                    <p className="text-gray-600 text-sm">Track your recovery journey</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/patient/injury-report" className="group">
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Update Report</h3>
                    <p className="text-gray-600 text-sm">Modify your injury information</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
        
        {/* AI Recommendations Preview */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <Brain className="w-8 h-8 text-indigo-600 mr-3" />
                  AI Recommended Exercises
                </h2>
                <p className="text-gray-600">Personalized based on your injury report</p>
              </div>
              <Link 
                href="/patient/exercises"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.slice(0, 4).map((exercise, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{exercise.description}</p>
                  
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Sets</p>
                      <p className="font-bold text-gray-900">{exercise.sets}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Reps</p>
                      <p className="font-bold text-gray-900">{exercise.reps}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-bold text-gray-900">{exercise.duration}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Exercises Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Therapist Assigned Exercises</h2>
              <p className="text-gray-600">Additional exercises from your healthcare provider</p>
            </div>
          </div>
          
          {exercises.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.9 + (index * 0.1),
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                >
                  <ExerciseCard exercise={exercise} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
              className="bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl p-12 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="inline-flex p-6 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mb-6">
                  <Target className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Therapist Exercises Yet</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Your therapist hasn't assigned any additional exercises. Focus on your AI-recommended program for now!
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}