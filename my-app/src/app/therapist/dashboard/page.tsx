// app/therapist/dashboard/page.tsx
'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Users, Activity, AlertCircle, TrendingUp } from 'lucide-react'

export default function TherapistDashboard() {
  const { patients } = useStore()
  const { user } = useUser()
  
  // Get therapist's first name or fallback to "Doctor"
  const therapistName = user?.firstName || user?.username || "Doctor"
  
  // Find patients who haven't completed any exercises in the last 2 days
  const nonAdherentPatients = patients.filter(patient => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    return !patient.lastActivity || new Date(patient.lastActivity) < twoDaysAgo
  })
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-100 mb-2"
      >
        Dr. {therapistName}'s Dashboard
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-gray-300 mb-8"
      >
        Welcome back, Dr. {therapistName}. Here's an overview of your patients' progress.
      </motion.p>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Total Patients</h3>
              <p className="text-2xl text-gray-800 font-bold">{patients.length}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Active Today</h3>
              <p className="text-2xl text-gray-800 font-bold">
                {patients.filter(p => p.lastActivity === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Needs Attention</h3>
              <p className="text-2xl text-gray-800 font-bold">{nonAdherentPatients.length}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Avg. Progress</h3>
              <p className="text-2xl text-gray-800 font-bold">
                {patients.length > 0 
                  ? Math.round(patients.reduce((sum, p) => sum + (p.progress.length > 0 ? p.progress[p.progress.length-1].accuracy : 0), 0) / patients.length)
                  : 0}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Patient List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">Your Patients</h2>
          <Link 
            href="/therapist/assign" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Assign Exercises
          </Link>
        </div>
        
        {patients.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map(patient => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-blue-800">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastActivity || 'No activity'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="h-2 w-16 bg-gray-200 rounded-full mr-2">
                          <div 
                            className="h-full bg-green-600 rounded-full" 
                            style={{ width: `${Math.min(100, (patient.streak / 7) * 100)}%` }}
                          />
                        </div>
                        <span>{patient.streak} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.progress.length > 0 ? (
                        <div className="flex items-center">
                          <div className="h-2 w-16 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-full bg-blue-600 rounded-full" 
                              style={{ width: `${patient.progress[patient.progress.length-1].accuracy}%` }}
                            />
                          </div>
                          <span>{patient.progress[patient.progress.length-1].accuracy}%</span>
                        </div>
                      ) : 'No data'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/therapist/patients/${patient.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <div className="text-gray-400 mb-4">No patients assigned yet</div>
            <p className="text-gray-600">You don't have any patients assigned to you yet.</p>
          </div>
        )}
      </motion.div>
      
      {/* Alerts Section */}
      {nonAdherentPatients.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Patients Needing Attention
          </h3>
          
          <ul className="space-y-2">
            {nonAdherentPatients.map(patient => (
              <li key={patient.id} className="text-red-700">
                {patient.name} hasn't completed any exercises in the last 2 days.
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}