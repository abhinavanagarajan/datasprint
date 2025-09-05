    // app/patient/exercises/[id]/vr/page.tsx
    'use client'

    import { useParams, useRouter } from 'next/navigation'
    import { useStore } from '@/lib/store'
    import { motion } from 'framer-motion'
    import { useState, useEffect } from 'react'
    import { ArrowLeft, Glasses, Zap, Gamepad2, MonitorSpeaker, Settings, Play, Pause, RotateCcw } from 'lucide-react'
    import Link from 'next/link'

    export default function VRExercise() {
    const params = useParams()
    const router = useRouter()
    const { exercises } = useStore()
    const [vrStatus, setVrStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
    const [isSessionActive, setIsSessionActive] = useState(false)
    const [sessionTime, setSessionTime] = useState(0)
    const [vrScore, setVrScore] = useState(0)
    const [isRetrying, setIsRetrying] = useState(false)

    const exercise = exercises.find(ex => ex.id === params.id)

    useEffect(() => {
        // Simulate VR device detection
        const checkVRSupport = async () => {
        try {
            // Check for WebXR support
            if ('xr' in navigator) {
            const xr = (navigator as any).xr
            const isSupported = await xr.isSessionSupported('immersive-vr')
            setVrStatus(isSupported ? 'available' : 'unavailable')
            } else {
            setVrStatus('unavailable')
            }
        } catch (error) {
            console.error('VR check failed:', error)
            setVrStatus('unavailable')
        }
        }

        checkVRSupport()
    }, [])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isSessionActive) {
        interval = setInterval(() => {
            setSessionTime(prev => prev + 1)
            // Simulate scoring
            setVrScore(prev => Math.min(100, prev + Math.random() * 2))
        }, 1000)
        }
        return () => clearInterval(interval)
    }, [isSessionActive])

    const startVRSession = () => {
        setIsSessionActive(true)
        setSessionTime(0)
        setVrScore(0)
    }

    const stopVRSession = () => {
        setIsSessionActive(false)
    }

    const resetSession = () => {
        setIsSessionActive(false)
        setSessionTime(0)
        setVrScore(0)
    }

    const retryVRConnection = async () => {
        setIsRetrying(true)
        setVrStatus('checking')
        
        // Simulate checking for VR device for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        // After 5 seconds, show alert that VR is not connected
        alert('VR is not connected. Please ensure your VR headset is properly connected and try again.')
        setVrStatus('unavailable')
        setIsRetrying(false)
    }

    if (!exercise) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Exercise Not Found</h1>
            <Link href="/patient/exercises" className="text-blue-400 hover:text-blue-300">
                ← Back to Exercises
            </Link>
            </div>
        </div>
        )
    }

    if (!exercise.vrSupported) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">VR Not Supported</h1>
            <p className="text-gray-400 mb-6">This exercise doesn't support VR mode yet.</p>
            <Link href={`/patient/exercises/${exercise.id}`} className="text-blue-400 hover:text-blue-300">
                ← Try Regular Mode
            </Link>
            </div>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        {/* Header */}
        <div className="p-6 border-b border-purple-800/30">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link 
                href="/patient/exercises"
                className="p-2 rounded-lg bg-purple-800/30 text-purple-300 hover:bg-purple-700/40 transition-colors"
                >
                <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600">
                    <Glasses className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">VR Exercise Mode</h1>
                    <p className="text-purple-300">{exercise.title}</p>
                </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${{
                checking: 'bg-yellow-100 text-yellow-800',
                available: 'bg-green-100 text-green-800',
                unavailable: 'bg-red-100 text-red-800'
                }[vrStatus]}`}>
                VR {vrStatus.toUpperCase()}
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main VR View */}
            <div className="lg:col-span-2">
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 rounded-xl border border-purple-700/30 p-6"
                >
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {vrStatus === 'checking' && (
                    <div className="text-center text-white">
                        <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>{isRetrying ? 'Retrying VR device connection...' : 'Checking VR device...'}</p>
                        {isRetrying && (
                        <p className="text-sm text-purple-300 mt-2">This may take a few seconds</p>
                        )}
                    </div>
                    )}
                    
                    {vrStatus === 'unavailable' && (
                    <div className="text-center text-white">
                        <Glasses className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">VR Device Not Found</h3>
                        <p className="text-gray-400 mb-4">Please connect a VR headset to continue</p>
                        <button 
                        onClick={retryVRConnection}
                        disabled={isRetrying}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        >
                        {isRetrying ? (
                            <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Checking Connection...
                            </>
                        ) : (
                            'Retry Detection'
                        )}
                        </button>
                    </div>
                    )}

                    {vrStatus === 'available' && !isSessionActive && (
                    <div className="text-center text-white">
                        <Glasses className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Ready for VR</h3>
                        <p className="text-gray-400 mb-6">Put on your headset and start the exercise</p>
                        <button
                        onClick={startVRSession}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                        >
                        <Play className="h-5 w-5" />
                        Start VR Session
                        </button>
                    </div>
                    )}

                    {vrStatus === 'available' && isSessionActive && (
                    <div className="text-center text-white relative">
                        {/* Simulated VR Environment */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-pulse"></div>
                        <div className="relative z-10">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-semibold">VR SESSION ACTIVE</span>
                        </div>
                        <div className="mb-4">
                            <div className="text-3xl font-bold mb-2">{Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</div>
                            <div className="text-purple-300">Session Time</div>
                        </div>
                        <div className="mb-6">
                            <div className="text-2xl font-bold text-yellow-400 mb-2">{vrScore.toFixed(0)}/100</div>
                            <div className="text-purple-300">Performance Score</div>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                            onClick={stopVRSession}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                            <Pause className="h-4 w-4" />
                            Stop
                            </button>
                            <button
                            onClick={resetSession}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                            </button>
                        </div>
                        </div>
                    </div>
                    )}
                </div>

                {/* VR Controls */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                    <Gamepad2 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Controllers</div>
                    <div className="text-xs text-purple-300">Connected</div>
                    </div>
                    <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                    <MonitorSpeaker className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Audio</div>
                    <div className="text-xs text-purple-300">Spatial</div>
                    </div>
                    <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                    <Settings className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Tracking</div>
                    <div className="text-xs text-purple-300">6DOF</div>
                    </div>
                </div>
                </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Exercise Info */}
                <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
                >
                <h3 className="text-lg font-semibold text-white mb-4">Exercise Details</h3>
                <div className="space-y-3">
                    <div>
                    <div className="text-sm text-purple-300">Exercise</div>
                    <div className="text-white font-medium">{exercise.title}</div>
                    </div>
                    <div>
                    <div className="text-sm text-purple-300">Difficulty</div>
                    <div className="text-white font-medium capitalize">{exercise.difficulty}</div>
                    </div>
                    <div>
                    <div className="text-sm text-purple-300">Sets × Reps</div>
                    <div className="text-white font-medium">{exercise.sets} × {exercise.reps}</div>
                    </div>
                    <div>
                    <div className="text-sm text-purple-300">Duration</div>
                    <div className="text-white font-medium">{exercise.duration}s per set</div>
                    </div>
                </div>
                </motion.div>

                {/* VR Benefits */}
                <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
                >
                <h3 className="text-lg font-semibold text-white mb-4">VR Benefits</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-white text-sm">Immersive experience</span>
                    </div>
                    <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-white text-sm">Real-time feedback</span>
                    </div>
                    <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-white text-sm">Gamified progress</span>
                    </div>
                    <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-white text-sm">Enhanced motivation</span>
                    </div>
                </div>
                </motion.div>

                {/* Instructions */}
                <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
                >
                <h3 className="text-lg font-semibold text-white mb-4">VR Instructions</h3>
                <div className="space-y-2 text-sm text-purple-300">
                    <p>1. Put on your VR headset</p>
                    <p>2. Ensure controllers are connected</p>
                    <p>3. Follow the virtual instructor</p>
                    <p>4. Maintain proper form</p>
                    <p>5. Complete all sets and reps</p>
                </div>
                </motion.div>
            </div>
            </div>
        </div>
        </div>
    )
    }
