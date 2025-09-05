// app/patient/daily-progress/page.tsx
'use client'

import { useStore } from '@/lib/store'
import { usePostureAnalysis } from '@/hooks/usePostureAnalysis'
import { useDatabase } from '@/hooks/useDatabase'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  Target, Calendar, Clock, Activity, BarChart3, CheckCircle, Timer, Zap,
  PlayCircle, PauseCircle, RotateCcw, Camera, Video, Wifi, WifiOff,
  Volume2, VolumeX, User, BookOpen, Star, TrendingUp
} from 'lucide-react'
import AIChatbot from '@/components/AIChatbot'

interface DailyGoal {
  type: 'exercises' | 'time' | 'accuracy'
  target: number
  current: number
  unit: string
}

interface ExerciseAssignment {
  id: string
  therapistId: string
  patientId: string
  exerciseId: string
  assignedDate: string
  dueDate?: string
  targetReps?: number
  targetSets?: number
  targetDuration?: number
  notes?: string
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped'
  exercise?: {
    id: string
    name: string
    description: string
    instructions: string[]
    targetBodyParts: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    duration: number
    imageUrl?: string
  }
  createdAt: string
  updatedAt: string
}

export default function PatientDailyProgress() {
  const { progress } = useStore()
  const { user } = useUser()
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week')
  const [todayExerciseTime, setTodayExerciseTime] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [currentPatient, setCurrentPatient] = useState<any>(null)
  const [assignedExercises, setAssignedExercises] = useState<ExerciseAssignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<ExerciseAssignment | null>(null)
  const [dailyProgress, setDailyProgress] = useState<any>(null)
  
  // Database hook
  const {
    loading: dbLoading,
    error: dbError,
    getPatient,
    getPatientAssignments,
    getPatientProgress,
    saveProgress,
    updateAssignmentStatus,
    clearError: clearDbError
  } = useDatabase()
  
  // Computer Vision Integration
  const {
    isConnected,
    sessionId,
    currentExercise,
    availableExercises,
    errors,
    isAnalyzing,
    success,
    score,
    is_correct,
    exercise_name,
    feedback_messages,
    annotated_frame,
    individual_scores,
    videoRef,
    canvasRef,
    connect,
    disconnect,
    startCamera,
    stopCamera,
    startAnalysis,
    stopAnalysis,
    changeExercise,
    clearError
  } = usePostureAnalysis()

  const userName = user?.firstName || 'Patient'

  // Initialize patient data and assignments
  useEffect(() => {
    const initializePatientData = async () => {
      if (!user?.id) return
      
      try {
        // Get current patient profile
        const patient = await getPatient()
        if (patient) {
          setCurrentPatient(patient)
          
          // Get assigned exercises
          const assignments = await getPatientAssignments(patient.id)
          setAssignedExercises(assignments)
          
          // Get progress data
          const progressData = await getPatientProgress(patient.id, 30)
          if (progressData) {
            setDailyProgress(progressData)
          }
        }
      } catch (error) {
        console.error('Error initializing patient data:', error)
      }
    }

    initializePatientData()
  }, [user?.id, getPatient, getPatientAssignments, getPatientProgress])

  useEffect(() => {
    // Timer for daily exercise tracking
    let interval: NodeJS.Timeout
    if (isTimerActive) {
      interval = setInterval(() => {
        setTodayExerciseTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive])

  useEffect(() => {
    // Connect to WebSocket when component mounts
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  const today = new Date().toISOString().split('T')[0]
  const todayProgress = progress.find(p => p.date === today)
  
  // Calculate weekly progress
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()
  
  const weeklyProgress = last7Days.map(date => {
    const dayProgress = progress.find(p => p.date === date)
    return {
      date,
      completed: dayProgress?.completed || 0,
      timeSpent: dayProgress?.timeSpent || 0,
      accuracy: dayProgress?.accuracy || 0
    }
  })

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Daily goals using computer vision data and database assignments
  const completedExercisesToday = assignedExercises.filter(assignment => 
    assignment.status === 'completed' && 
    new Date(assignment.updatedAt).toDateString() === new Date().toDateString()
  ).length

  const totalAssignedExercises = assignedExercises.filter(assignment => 
    assignment.status !== 'skipped'
  ).length

  const dailyGoals: DailyGoal[] = [
    {
      type: 'exercises',
      target: Math.max(totalAssignedExercises, 3), // At least 3 exercises or number of assigned exercises
      current: completedExercisesToday + (success ? 1 : 0),
      unit: 'exercises'
    },
    {
      type: 'time',
      target: 30,
      current: Math.floor(todayExerciseTime / 60),
      unit: 'minutes'
    },
    {
      type: 'accuracy',
      target: 85,
      current: Math.round((score || dailyProgress?.analytics?.averageAccuracy || 0) * (dailyProgress?.analytics?.averageAccuracy ? 1 : 100)),
      unit: '%'
    }
  ]

  // Real-time stats from computer vision
  const stats = [
    {
      label: 'Current Score',
      value: `${Math.round((score || 0) * 100)}%`,
      icon: Target,
      color: 'from-emerald-500 to-green-600',
      bgGlow: 'shadow-emerald-500/20',
      percentage: Math.round((score || 0) * 100),
      delay: 0.1
    },
    {
      label: 'Exercise Status',
      value: is_correct ? 'Correct' : 'Improving',
      icon: CheckCircle,
      color: is_correct ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-600',
      bgGlow: is_correct ? 'shadow-green-500/20' : 'shadow-yellow-500/20',
      percentage: is_correct ? 100 : 50,
      delay: 0.2
    },
    {
      label: 'Connection',
      value: isConnected ? 'Connected' : 'Disconnected',
      icon: isConnected ? Wifi : WifiOff,
      color: isConnected ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-rose-600',
      bgGlow: isConnected ? 'shadow-blue-500/20' : 'shadow-red-500/20',
      percentage: isConnected ? 100 : 0,
      delay: 0.3
    },
    {
      label: 'Session Time',
      value: formatTime(todayExerciseTime),
      icon: Clock,
      color: 'from-purple-500 to-indigo-600',
      bgGlow: 'shadow-purple-500/20',
      percentage: Math.min((todayExerciseTime / 1800) * 100, 100), // 30 minutes target
      delay: 0.4
    }
  ]

  const handleStartExercise = async () => {
    try {
      if (!isConnected) {
        await connect()
      }
      await startCamera()
      startAnalysis()
      setIsTimerActive(true)
      
      // Mark assignment as in progress if one is selected
      if (selectedAssignment && selectedAssignment.status === 'assigned') {
        await updateAssignmentStatus(selectedAssignment.id, 'in_progress')
        
        // Update local state
        setAssignedExercises(prev => 
          prev.map(assignment => 
            assignment.id === selectedAssignment.id 
              ? { ...assignment, status: 'in_progress' as const }
              : assignment
          )
        )
      }
    } catch (error) {
      console.error('Failed to start exercise:', error)
    }
  }

  const handleStopExercise = () => {
    stopAnalysis()
    stopCamera()
    setIsTimerActive(false)
  }

  const handleCompleteExercise = async () => {
    if (!currentPatient) return

    try {
      // Save progress to database
      const progressData = await saveProgress({
        patientId: currentPatient.id,
        exerciseAssignmentId: selectedAssignment?.id,
        exerciseName: exercise_name || selectedAssignment?.exercise?.name || 'Manual Exercise',
        duration: todayExerciseTime,
        accuracy: Math.round((score || 0) * 100),
        score: score || 0,
        feedback: feedback_messages || [],
        videoAnalysisData: {
          individual_scores: individual_scores || {},
          pose_landmarks: [],
          exercise_specific_feedback: feedback_messages || []
        }
      })

      if (progressData && selectedAssignment) {
        // Mark assignment as completed
        await updateAssignmentStatus(selectedAssignment.id, 'completed')
        
        // Update local state
        setAssignedExercises(prev => 
          prev.map(assignment => 
            assignment.id === selectedAssignment.id 
              ? { ...assignment, status: 'completed' as const }
              : assignment
          )
        )
        
        // Reset timer and stop exercise
        handleStopExercise()
        setTodayExerciseTime(0)
        setSelectedAssignment(null)
        
        // Show success message
        alert(`Exercise completed! Score: ${Math.round((score || 0) * 100)}%`)
      }
    } catch (error) {
      console.error('Failed to complete exercise:', error)
    }
  }

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
          className="text-center mb-8"
        >
          <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
            <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Daily Progress - {new Date().toLocaleDateString()}</span>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r py-4 from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
            {userName}'s Recovery Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your daily progress with real-time computer vision analysis
          </p>
        </motion.div>

        {/* Assigned Exercises Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpen className="w-6 h-6 text-indigo-600 mr-2" />
            Exercises Assigned by Your Therapist
          </h2>
          
          {assignedExercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedExercises.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -4 }}
                  className={`bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 ${
                    selectedAssignment?.id === assignment.id 
                      ? 'ring-2 ring-indigo-500 bg-indigo-50/80' 
                      : 'hover:shadow-xl'
                  }`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{assignment.exercise?.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{assignment.exercise?.difficulty}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      assignment.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : assignment.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {assignment.exercise?.description}
                  </p>
                  
                  <div className="space-y-2">
                    {assignment.targetDuration && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Target Duration:</span>
                        <span className="font-semibold">{assignment.targetDuration} min</span>
                      </div>
                    )}
                    {assignment.targetReps && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Target Reps:</span>
                        <span className="font-semibold">{assignment.targetReps}</span>
                      </div>
                    )}
                    {assignment.dueDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-semibold">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {assignment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Therapist Notes:</strong> {assignment.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {assignment.exercise?.targetBodyParts.map((part, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exercises Assigned Yet</h3>
              <p className="text-gray-600 mb-4">
                Your therapist hasn't assigned any exercises yet. Contact them to get started with your rehabilitation program.
              </p>
              <div className="text-sm text-gray-500">
                You can still use the computer vision system below for free-form exercises.
              </div>
            </div>
          )}
        </motion.div>

        {/* Daily Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="w-6 h-6 text-indigo-600 mr-2" />
            Today's Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dailyGoals.map((goal, index) => (
              <motion.div
                key={goal.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {goal.type === 'exercises' && <Target className="w-5 h-5 text-emerald-600" />}
                    {goal.type === 'time' && <Clock className="w-5 h-5 text-blue-600" />}
                    {goal.type === 'accuracy' && <Zap className="w-5 h-5 text-amber-600" />}
                    <span className="font-semibold text-gray-700 capitalize">{goal.type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    goal.current >= goal.target ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {goal.current >= goal.target ? 'Complete' : 'In Progress'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{goal.current}</span>
                    <span className="text-sm text-gray-500">/ {goal.target} {goal.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        goal.current >= goal.target ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Real-time Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-6 h-6 text-indigo-600 mr-2" />
            Live Computer Vision Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className={`relative bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl ${stat.bgGlow} group-hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 relative">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="2"/>
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="16" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            strokeDasharray={`${stat.percentage || 0} 100`}
                            className="text-blue-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">{stat.percentage || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Computer Vision Exercise Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Camera className="w-6 h-6 text-indigo-600 mr-2" />
                Real-Time Exercise Analysis
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    audioEnabled 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{audioEnabled ? 'Audio On' : 'Audio Off'}</span>
                </button>
                <button
                  onClick={isAnalyzing ? handleStopExercise : handleStartExercise}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isAnalyzing 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isAnalyzing ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  <span>{isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}</span>
                </button>
                {isAnalyzing && selectedAssignment && (
                  <button
                    onClick={handleCompleteExercise}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Exercise</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Feed */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Live Camera Feed</h3>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  {annotated_frame && (
                    <div className="absolute inset-0">
                      <img 
                        src={`data:image/jpeg;base64,${annotated_frame}`} 
                        alt="Annotated pose"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  {!isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white">
                        <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Click "Start Analysis" to begin</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exercise Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Exercise Information</h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {selectedAssignment ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Assigned Exercise</label>
                        <p className="text-xl font-bold text-gray-900">{selectedAssignment.exercise?.name}</p>
                        <p className="text-sm text-gray-600">{selectedAssignment.exercise?.description}</p>
                      </div>
                      
                      {selectedAssignment.exercise?.instructions && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Instructions</label>
                          <ul className="mt-2 space-y-1">
                            {selectedAssignment.exercise.instructions.map((instruction, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                                  {index + 1}
                                </span>
                                {instruction}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {selectedAssignment.targetDuration && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Target Duration</label>
                            <p className="text-lg font-bold text-gray-900">{selectedAssignment.targetDuration} min</p>
                          </div>
                        )}
                        {selectedAssignment.targetReps && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Target Reps</label>
                            <p className="text-lg font-bold text-gray-900">{selectedAssignment.targetReps}</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Exercise</label>
                      <p className="text-xl font-bold text-gray-900">{exercise_name || currentExercise || 'None Selected'}</p>
                      <p className="text-sm text-gray-500 mt-2">Select an assigned exercise above or choose from available exercises below</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Real-time Score</label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round((score || 0) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{Math.round((score || 0) * 100)}%</span>
                    </div>
                  </div>

                  {feedback_messages && feedback_messages.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Live Feedback</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {feedback_messages.map((message, index) => (
                          <p key={index} className="text-sm text-blue-800 mb-1">{message}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {individual_scores && Object.keys(individual_scores).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Individual Joint Scores</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(individual_scores).map(([joint, score]) => (
                          <div key={joint} className="bg-white rounded p-2 border">
                            <p className="text-xs font-medium text-gray-600 capitalize">{joint}</p>
                            <p className="text-sm font-bold text-gray-900">{Math.round((score as number) * 100)}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exercise Selection */}
            {availableExercises && availableExercises.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Exercises</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableExercises.map((exercise, index) => (
                    <button
                      key={index}
                      onClick={() => changeExercise(exercise)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        exercise === currentExercise
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {exercise}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Connection Status */}
            <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                  {isConnected ? 'Connected to Computer Vision Server' : 'Disconnected from Server'}
                </span>
              </div>
              {sessionId && (
                <span className="text-sm text-gray-500">Session: {String(sessionId).slice(0, 8)}...</span>
              )}
            </div>

            {/* Error Display */}
            {errors && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-red-700">{errors}</p>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Exercise Timer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Timer className="w-6 h-6 text-indigo-600 mr-2" />
                Exercise Timer
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isTimerActive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isTimerActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  <span>{isTimerActive ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  onClick={() => setTodayExerciseTime(0)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
                {formatTime(todayExerciseTime)}
              </div>
              <p className="text-lg text-gray-600">Today's Exercise Time</p>
            </div>
          </div>
        </motion.div>

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 text-indigo-600 mr-2" />
                Weekly Progress Analytics
              </h2>
              <div className="flex space-x-2">
                {(['week', 'month', 'all'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedTimeframe === timeframe
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {dailyProgress?.analytics ? (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{dailyProgress.analytics.totalExercises}</p>
                    <p className="text-sm text-gray-600">Total Exercises</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{Math.round(dailyProgress.analytics.totalTime / 60)}m</p>
                    <p className="text-sm text-gray-600">Total Time</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{Math.round(dailyProgress.analytics.averageAccuracy)}%</p>
                    <p className="text-sm text-gray-600">Avg Accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(dailyProgress.analytics.exerciseFrequency).length}</p>
                    <p className="text-sm text-gray-600">Exercise Types</p>
                  </div>
                </div>

                {/* Weekly Progress Grid */}
                <div className="grid grid-cols-7 gap-4 mb-4">
                  {dailyProgress.analytics.weeklyProgress.map((week: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Week {index + 1}
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 space-y-2">
                        <div className="text-xs text-gray-600">Exercises</div>
                        <div className="text-lg font-bold text-gray-900">{week.exercises}</div>
                        <div className="text-xs text-gray-600">Accuracy</div>
                        <div className="text-sm font-bold text-gray-900">{Math.round(week.accuracy)}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.round(week.accuracy)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exercise Frequency */}
                {Object.keys(dailyProgress.analytics.exerciseFrequency).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Exercise Frequency</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(dailyProgress.analytics.exerciseFrequency).map(([exerciseName, count]) => (
                        <div key={exerciseName} className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="font-semibold text-gray-900">{exerciseName}</p>
                          <p className="text-2xl font-bold text-indigo-600">{count as number}</p>
                          <p className="text-sm text-gray-600">sessions</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Data Yet</h3>
                <p className="text-gray-600">Complete some exercises to see your progress analytics here.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Error Display */}
        {dbError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-700">{dbError}</p>
                <button
                  onClick={clearDbError}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Chatbot - Fixed Position */}
      <AIChatbot 
        patientId={currentPatient?.id}
        position="fixed"
        theme="light"
      />
    </div>
  )
}
