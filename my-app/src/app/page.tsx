"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Decorative background gradient blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight"
          >
            Gamified <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Rehabilitation</span> Platform
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-2xl text-gray-700 max-w-2xl mx-auto"
          >
            Making physical therapy <span className="font-semibold">engaging</span> and <span className="font-semibold">effective</span> through gamification and real-time feedback.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/patient/dashboard" 
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              I'm a Patient
            </Link>
            <Link 
              href="/therapist/dashboard" 
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              I'm a Therapist
            </Link>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-10 py-20">
          {[
            {
              title: "Real-time Feedback",
              text: "Get instant feedback on your exercise form using our AI pose detection technology.",
              color: "blue",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              )
            },
            {
              title: "Progress Tracking",
              text: "Monitor your improvement with detailed analytics, charts, and achievement milestones.",
              color: "green",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )
            },
            {
              title: "Gamified Experience",
              text: "Earn points, badges, and rewards for completing exercises and maintaining streaks.",
              color: "purple",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              )
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all p-8"
            >
              <div className={`w-14 h-14 flex items-center justify-center rounded-xl bg-${feature.color}-100 mb-6`}>
                <svg className={`w-7 h-7 text-${feature.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-black">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
