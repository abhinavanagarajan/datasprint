// app/therapist/dashboard/page.tsx
'use client'

import { useDatabase } from '@/hooks/useDatabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { 
  Users, Activity, AlertCircle, TrendingUp, Calendar, Clock, 
  Target, Plus, Eye, MessageCircle, BarChart3, User, 
  CheckCircle, XCircle, PlayCircle
} from 'lucide-react'

interface Patient {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  injuryType: string
  injuryDate: string
  therapistId?: string
  createdAt: string
  updatedAt: string
}

interface PatientAnalytics {
  totalExercises: number
  totalTime: number
  averageAccuracy: number
  exerciseFrequency: Record<string, number>
  weeklyProgress: Array<{
    week: string
    exercises: number
    accuracy: number
    time: number
  }>
}

interface PatientWithAnalytics extends Patient {
  analytics?: PatientAnalytics
  assignments?: any[]
  recentProgress?: any[]
}

export default function TherapistDashboard() {
  const { user } = useUser()
  const [currentTherapist, setCurrentTherapist] = useState<any>(null)
  const [patients, setPatients] = useState<PatientWithAnalytics[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientWithAnalytics | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [availableExercises, setAvailableExercises] = useState<any[]>([])
  
  const {
    loading,
    error,
    getTherapist,
    getPatientsByTherapist,
    getAllExercises,
    getPatientProgress,
    assignExercise,
    clearError: clearDbError
  } = useDatabase()
  
  const therapistName = user?.firstName || user?.username || "Doctor"

  // Initialize therapist data
  useEffect(() => {
    const initializeTherapistData = async () => {
      if (!user?.id) return
      
      try {
        const therapist = await getTherapist()
        if (therapist) {
          setCurrentTherapist(therapist)
          
          // Get therapist's patients
          const therapistPatients = await getPatientsByTherapist(therapist.id)
          
          // Get analytics for each patient
          const patientsWithAnalytics = await Promise.all(
            therapistPatients.map(async (patient: Patient) => {
              try {
                const progressData = await getPatientProgress(patient.id, 30)
                return {
                  ...patient,
                  analytics: progressData?.analytics,
                  recentProgress: progressData?.progressEntries?.slice(-5) || []
                }
              } catch (error) {
                console.error(`Error fetching progress for patient ${patient.id}:`, error)
                return patient
              }
            })
          )
          
          setPatients(patientsWithAnalytics)
        }
        
        // Get available exercises
        const exercises = await getAllExercises()
        setAvailableExercises(exercises)
      } catch (error) {
        console.error('Error initializing therapist data:', error)
      }
    }

    initializeTherapistData()
  }, [user?.id, getTherapist, getPatientsByTherapist, getPatientProgress, getAllExercises])

  // Calculate stats
  const totalPatients = patients.length
  const activePatients = patients.filter(p => {
    const today = new Date().toDateString()
    return p.recentProgress?.some(progress => 
      new Date(progress.date).toDateString() === today
    )
  }).length
  
  const averageAccuracy = patients.length > 0 
    ? Math.round(patients.reduce((sum, p) => sum + (p.analytics?.averageAccuracy || 0), 0) / patients.length)
    : 0

  const needsAttentionPatients = patients.filter(p => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    return !p.recentProgress?.length || 
           new Date(p.recentProgress[p.recentProgress.length - 1]?.date || '') < twoDaysAgo
  })

  const handleAssignExercise = async (exerciseId: string, patientId: string, notes: string) => {
    if (!currentTherapist) return

    try {
      await assignExercise({
        therapistId: currentTherapist.id,
        patientId,
        exerciseId,
        notes,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
      })
      
      setShowAssignModal(false)
      alert('Exercise assigned successfully!')
    } catch (error) {
      console.error('Error assigning exercise:', error)
      alert('Failed to assign exercise. Please try again.')
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
            <span className="text-sm font-medium text-gray-700">Therapist Dashboard - {new Date().toLocaleDateString()}</span>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r py-4 from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
            Dr. {therapistName}'s Practice
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor patient progress, assign exercises, and track rehabilitation outcomes
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Total Patients</h3>
                <p className="text-2xl text-gray-800 font-bold">{totalPatients}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Active Today</h3>
                <p className="text-2xl text-gray-800 font-bold">{activePatients}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg mr-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Needs Attention</h3>
                <p className="text-2xl text-gray-800 font-bold">{needsAttentionPatients.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Avg. Progress</h3>
                <p className="text-2xl text-gray-800 font-bold">{averageAccuracy}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Patient List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 text-indigo-600 mr-2" />
                Patient Management
              </h2>
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Exercise</span>
              </button>
            </div>
            
            {patients.length > 0 ? (
              <div className="space-y-4">
                {patients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-indigo-800">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                          <div className="text-sm text-gray-500">
                            Injury: {patient.injuryType} ({new Date(patient.injuryDate).toLocaleDateString()})
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        {/* Recent Activity */}
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Recent Activity</div>
                          <div className="text-lg font-bold text-gray-900">
                            {patient.recentProgress?.length ? (
                              new Date(patient.recentProgress[patient.recentProgress.length - 1].date).toLocaleDateString()
                            ) : 'No activity'}
                          </div>
                        </div>
                        
                        {/* Progress */}
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Avg. Accuracy</div>
                          <div className="text-lg font-bold text-gray-900">
                            {patient.analytics?.averageAccuracy ? Math.round(patient.analytics.averageAccuracy) : 0}%
                          </div>
                        </div>
                        
                        {/* Total Exercises */}
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Total Exercises</div>
                          <div className="text-lg font-bold text-gray-900">
                            {patient.analytics?.totalExercises || 0}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <Link
                            href={`/therapist/patients/${patient.id}`}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>Details</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mini Progress Chart */}
                    {patient.analytics?.weeklyProgress && (
                      <div className="mt-4 grid grid-cols-7 gap-2">
                        {patient.analytics.weeklyProgress.slice(-7).map((week, index) => (
                          <div key={index} className="text-center">
                            <div className="text-xs text-gray-500 mb-1">W{index + 1}</div>
                            <div className="h-8 bg-gray-200 rounded flex items-end">
                              <div 
                                className="w-full bg-blue-500 rounded"
                                style={{ height: `${(week.accuracy / 100) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{Math.round(week.accuracy)}%</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Assigned</h3>
                <p className="text-gray-600">You don't have any patients assigned to you yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Alerts Section */}
        {needsAttentionPatients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Patients Needing Attention
              </h3>
              
              <div className="space-y-3">
                {needsAttentionPatients.map(patient => (
                  <div key={patient.id} className="flex items-center justify-between bg-white rounded-lg p-4">
                    <div>
                      <div className="font-semibold text-red-800">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-red-600">
                        No activity in the last 2 days
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                    >
                      Contact
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-700">{error}</p>
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
      
      {/* Exercise Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Exercise</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="">Choose a patient...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Exercise
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableExercises.map(exercise => (
                    <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {exercise.difficulty}
                        </span>
                        <span className="text-sm text-gray-500">{exercise.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes for Patient
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Add any specific instructions or notes..."
                ></textarea>
              </div>
              
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Assign Exercise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}