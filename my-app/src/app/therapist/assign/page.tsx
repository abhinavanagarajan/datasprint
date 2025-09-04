'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TherapistAssign() {
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedExercise, setSelectedExercise] = useState('')
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [duration, setDuration] = useState(30)
  
  // These would come from the backend in a real application
  const patients = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' }
  ]
  
  const exercises = [
    { id: '1', name: 'Arm Curls' },
    { id: '2', name: 'Shoulder Press' },
    { id: '3', name: 'Leg Raises' },
    { id: '4', name: 'Knee Bends' }
  ]
  
  const handleAssign = () => {
    // This would connect to the backend in a real application
    alert(`Exercise assigned to patient: ${selectedPatient} with ${sets} sets, ${reps} reps, ${duration} seconds`)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 mb-8"
        >
          Assign Exercises
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
              <select 
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 bg-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Choose a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Exercise</label>
              <select 
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 bg-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Choose an exercise</option>
                {exercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sets</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reps</label>
              <input 
                type="number" 
                min="1" 
                max="50" 
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
              <input 
                type="number" 
                min="10" 
                max="300" 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <button 
            onClick={handleAssign}
            disabled={!selectedPatient || !selectedExercise}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 shadow-sm"
          >
            Assign Exercise
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-8"
        >
          <h2 className="text-xl text-gray-800 font-semibold mb-4">Recently Assigned Exercises</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Exercise</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sets × Reps</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">John Doe</td>
                  <td className="px-4 py-3 text-sm">Arm Curls</td>
                  <td className="px-4 py-3 text-sm">3 × 10</td>
                  <td className="px-4 py-3 text-sm">30s</td>
                  <td className="px-4 py-3 text-sm">2024-05-05</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">Jane Smith</td>
                  <td className="px-4 py-3 text-sm">Shoulder Press</td>
                  <td className="px-4 py-3 text-sm">3 × 12</td>
                  <td className="px-4 py-3 text-sm">45s</td>
                  <td className="px-4 py-3 text-sm">2024-05-04</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}