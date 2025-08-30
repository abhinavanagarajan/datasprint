// app/patient/dashboard/page.tsx
'use client'

import { useStore } from '@/lib/store'
import ExerciseCard from '@/components/ExerciseCard'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Calendar, Award, Sparkles, ChevronRight } from 'lucide-react'

export default function PatientDashboard() {
  const { exercises, progress, streak } = useStore()
  
  const completedExercises = exercises.filter(ex => ex.completed > 0).length
  const totalExercises = exercises.length
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
      value: exercises.length,
      color: 'from-purple-500 to-indigo-600',
      bgGlow: 'shadow-purple-500/25',
      delay: 0.4
    }
  ]
  
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
            <span className="text-sm font-medium text-gray-700">Welcome back to your journey</span>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
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
        
        {/* Exercises Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Exercise Journey</h2>
              <p className="text-gray-600">Practice makes progress. Every session counts.</p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-gray-500">Live progress tracking</span>
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
                    delay: 0.6 + (index * 0.1),
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 text-center border border-gray-200/50 shadow-xl"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
              <div className="relative z-10">
                <div className="inline-flex p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
                  <Target className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Begin</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  Your personalized exercise plan is being prepared. Your therapist will assign therapeutic exercises tailored just for you.
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Motivation Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-3xl"></div>
          <div className="absolute inset-0 bg-black/20 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative z-10 p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Outstanding Progress!</h3>
                    <p className="text-blue-100">You've completed {completedExercises} therapeutic exercises</p>
                  </div>
                </div>
                
                <p className="text-lg text-blue-100 mb-6 max-w-lg">
                  Consistency is the foundation of healing. Each exercise brings you closer to your wellness goals.
                </p>
                
                {streak >= 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30"
                  >
                    <Award className="h-6 w-6 mr-3 text-yellow-300" />
                    <span className="font-semibold text-white">
                      🔥 {streak}-day streak! You're crushing it!
                    </span>
                  </motion.div>
                )}
              </div>
              
              {/* Progress Visualization */}
              <div className="flex-shrink-0">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 40 * (1 - completionRate / 100)
                      }}
                      transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{completionRate}%</div>
                      <div className="text-sm text-blue-200 font-medium">Complete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}