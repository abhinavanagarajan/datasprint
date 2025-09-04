"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Time Machine Portal Background */}
      <div className="absolute inset-0">
        {/* Central spiral portal */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Multiple rotating rings creating portal effect */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full border-2 border-blue-400/30`}
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                left: `${-(i + 1) * 60}px`,
                top: `${-(i + 1) * 60}px`,
                animation: `spin${i % 2 === 0 ? '' : 'Reverse'} ${8 + i * 2}s linear infinite`,
                borderColor: `hsl(${200 + i * 20}, 70%, ${50 + i * 5}%)`,
              }}
            />
          ))}
          
          {/* Inner glowing core */}
          <div className="absolute w-32 h-32 -left-16 -top-16 rounded-full bg-gradient-radial from-cyan-400 via-blue-500 to-transparent animate-pulse"></div>
        </div>

        {/* Swirling energy particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
              style={{
                left: `${50 + Math.cos((i / 50) * 2 * Math.PI) * 40}%`,
                top: `${50 + Math.sin((i / 50) * 2 * Math.PI) * 40}%`,
                animation: `orbit ${10 + (i % 5)}s linear infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Time tunnel effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-900/20 to-black/80"></div>
        
        {/* Scanning lines effect */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{
                top: `${i * 20}%`,
                animation: `scan ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating UI Elements in Time Portal */}
      <div className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        {/* Hero Section - Emerging from Portal */}
        <div className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-8 perspective-1000 "
          >
            <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 animate-pulse">
                GAMIFIED
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 time-shift">
                REHABILITATION
              </span>
              <span className="block text-cyan-200 text-4xl md:text-5xl font-light mt-4 tracking-widest">
                ◆ PLATFORM ◆
              </span>
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <p className="text-xl md:text-2xl text-cyan-100 max-w-3xl mx-auto leading-relaxed font-light">
                 Step through the portal to the future of physical therapy
                <br />
                <span className="text-lg text-blue-200 mt-4 block">
                  Where healing meets technology in perfect harmony
                </span>
              </p>
            </motion.div>
          </motion.div>

          {/* Portal Entry Buttons */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <SignedOut>
              <SignInButton mode="modal">
                <button className="group relative px-12 py-6 rounded-full font-bold text-xl transition-all duration-500 overflow-hidden portal-button">
                  {/* Rotating border effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-conic from-cyan-400 via-blue-500 to-purple-500 animate-spin-slow"></div>
                  <div className="absolute inset-1 rounded-full bg-black"></div>
                  
                  <div className="relative text-white group-hover:text-cyan-300 transition-colors duration-300 z-10">
                    🔐 ENTER PORTAL
                  </div>
                  
                  {/* Glowing effect */}
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex gap-6 items-center">
                <Link 
                  href="/patient/injury-report" 
                  className="group relative px-12 py-6 rounded-full font-bold text-xl transition-all duration-500 overflow-hidden portal-button"
                >
                  {/* Rotating border effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-conic from-cyan-400 via-blue-500 to-purple-500 animate-spin-slow"></div>
                  <div className="absolute inset-1 rounded-full bg-black"></div>
                  
                  <div className="relative text-white group-hover:text-cyan-300 transition-colors duration-300 z-10">
                    🎮 PATIENT PORTAL
                  </div>
                  
                  {/* Glowing effect */}
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                </Link>
                
                <Link 
                  href="/therapist/dashboard" 
                  className="group relative px-12 py-6 rounded-full font-bold text-xl transition-all duration-500 overflow-hidden portal-button"
                >
                  {/* Rotating border effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-conic from-emerald-400 via-green-500 to-blue-500 animate-spin-slow"></div>
                  <div className="absolute inset-1 rounded-full bg-black"></div>
                  
                  <div className="relative text-white group-hover:text-emerald-300 transition-colors duration-300 z-10">
                    👩‍⚕️ THERAPIST PORTAL
                  </div>
                  
                  {/* Glowing effect */}
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                </Link>

                <div className="relative">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-16 h-16 rounded-full border-2 border-cyan-400 hover:border-cyan-300 transition-all duration-300",
                        userButtonPopoverCard: "bg-slate-800 border border-cyan-400/30"
                      }
                    }}
                  />
                </div>
              </div>
            </SignedIn>
          </motion.div>
        </div>

        {/* Time-Shifted Feature Modules */}
        <div className="grid md:grid-cols-3 gap-12 py-24">
          {[
            {
              title: "AI Neural Interface",
              text: "Advanced quantum pose detection from the year 2087 provides real-time biomechanical analysis with temporal precision.",
              timeYear: "2087",
              color: "cyan",
              emoji: "🤖",
              icon: "⚡"
            },
            {
              title: "Holographic Analytics",
              text: "4D progress visualization technology shows your improvement across multiple timelines and dimensional healing metrics.",
              timeYear: "2095",
              color: "emerald", 
              emoji: "📊",
              icon: "🔮"
            },
            {
              title: "Quantum Gamification",
              text: "Multi-dimensional achievement system with rewards that transcend space-time, unlocking abilities across parallel healing realities.",
              timeYear: "2103",
              color: "purple",
              emoji: "🏆", 
              icon: "🌌"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, rotateY: 90, z: -100 }}
              whileInView={{ opacity: 1, rotateY: 0, z: 0 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 10,
                z: 50,
                transition: { duration: 0.4 }
              }}
              transition={{ 
                duration: 1, 
                delay: i * 0.3
              }}
              className="group relative transform-3d"
            >
              {/* Time Machine Module Container */}
              <div className="relative h-full">
                {/* Holographic frame */}
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 time-frame"></div>
                <div className="absolute inset-1 rounded-2xl border border-blue-300/30"></div>
                
                {/* Main content area */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-8 h-full border border-cyan-400/20 group-hover:border-cyan-400/60 transition-all duration-500">
                  
                  {/* Time indicator */}
                  <div className="absolute top-4 right-4 text-xs text-cyan-400 font-mono bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/30">
                    {feature.timeYear}
                  </div>

                  {/* Feature icon with portal effect */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 mx-auto relative">
                      {/* Rotating rings around icon */}
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin-slow"></div>
                      <div className="absolute inset-2 rounded-full border border-blue-400/40 animate-spin-reverse"></div>
                      
                      {/* Icon container */}
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm flex items-center justify-center border border-cyan-400/30">
                        <span className="text-2xl">{feature.emoji}</span>
                        <span className="absolute text-sm">{feature.icon}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-cyan-100 group-hover:text-white transition-colors duration-300 text-center">
                    {feature.title}
                  </h3>
                  
                  <p className="text-blue-200 leading-relaxed font-light text-center">
                    {feature.text}
                  </p>

                  {/* Energy flow effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
                </div>

                {/* Dimensional shadow */}
                <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 transform translate-x-2 translate-y-2 -z-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Temporal Statistics Portal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center py-20"
        >
          <div className="relative">
            {/* Portal frame */}
            <div className="absolute inset-0 rounded-3xl border-4 border-dashed border-cyan-400/40 animate-spin-slow"></div>
            <div className="absolute inset-2 rounded-3xl border-2 border-blue-400/30 animate-spin-reverse"></div>
            
            {/* Content container */}
            <div className="relative backdrop-blur-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-cyan-400/30 rounded-3xl shadow-2xl p-12 mx-4">
              
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 mb-4">
                ⏰ TEMPORAL STATISTICS ⏰
              </h2>
              <p className="text-cyan-200 mb-12 text-lg">Data transmitted from across the space-time continuum</p>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { number: "∞", label: "Timelines Healed", color: "cyan", symbol: "🌀" },
                  { number: "99.9%", label: "Reality Success Rate", color: "emerald", symbol: "✨" },
                  { number: "∆T", label: "Dimensions Accessed", color: "purple", symbol: "🌌" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.1, rotateY: 15 }}
                    className="text-center group"
                  >
                    <div className="relative mb-4">
                      <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 group-hover:animate-pulse">
                        {stat.number}
                      </div>
                      <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                        {stat.symbol}
                      </div>
                    </div>
                    <div className="text-blue-200 text-lg font-light tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CSS for Time Machine Effects */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(100px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(100px) rotate(-360deg);
          }
        }

        @keyframes scan {
          0%, 100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spinReverse 15s linear infinite;
        }

        .time-frame {
          animation: spin 25s linear infinite;
          filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.5));
        }

        .time-shift {
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% {
            background-position: -200% center;
          }
          50% {
            background-position: 200% center;
          }
        }

        .portal-button:hover {
          transform: translateZ(20px);
          filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.6));
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        .bg-gradient-conic {
          background: conic-gradient(var(--tw-gradient-stops));
        }

        .transform-3d {
          transform-style: preserve-3d;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        /* Portal breathing effect */
        @keyframes portalPulse {
          0%, 100% {
            box-shadow: 
              0 0 20px rgba(6, 182, 212, 0.3),
              0 0 40px rgba(6, 182, 212, 0.2),
              0 0 60px rgba(6, 182, 212, 0.1);
          }
          50% {
            box-shadow: 
              0 0 30px rgba(6, 182, 212, 0.6),
              0 0 60px rgba(6, 182, 212, 0.4),
              0 0 90px rgba(6, 182, 212, 0.2);
          }
        }

        /* Energy ripple effect */
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        /* Add portal breathing to buttons */
        .portal-button {
          animation: portalPulse 2s ease-in-out infinite;
        }

        /* Floating animation for cards */
        .group:hover .transform-3d {
          animation: float 2s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotateY(0deg);
          }
          50% {
            transform: translateY(-10px) rotateY(5deg);
          }
        }
      `}</style>
    </div>
  )
}