// app/patient/exercises/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import PoseFeedback from '@/components/PoseFeedback'
import { usePostureAnalysis } from "@/hooks/usePostureAnalysis";
import  PaperDoll  from "@/components/PaperDoll";
import { motion } from 'framer-motion'
import { useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import { video } from 'framer-motion/client';

export default function ExerciseExecution() {
  const params = useParams()
  const { exercises, completeExercise } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)


  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000';
  const {
    isConnected,
    sessionId,
    currentExercise,
    availableExercises,
    lastResult,
    errors,
    isAnalyzing,
    imageSrc,
    landmarks,
    success,
    score,
    is_correct,
    exercise_name,
    feedback_messages,
    audio_feedback,
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
    clearError,
    analyzeFrame,
    speakFeedback
  } = usePostureAnalysis(websocketUrl);

  const videoRefs = useCallback((node: HTMLVideoElement) => {
    if (node) {
      setVideoElement(node);
      if (videoRef.current !== node) {
        videoRef.current = node;
      }
      console.log('Video ref set', videoRef.current);
    }
  }, [])

  const startCameras = async () => {
    try {
      setError(null);
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      // Store stream reference
      streamRef.current = stream;
      
      // Set up video element
      if (videoElement) {
        videoElement.srcObject = stream;
        try {
          await videoElement.play();
          setHasPermission(true);
        } catch (playError) {
          console.error('Error playing video:', playError);
          setError('Failed to start video playback');
        }
      } else {
        setError('Video element not initialized');
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(err.message || 'Failed to access camera');
      setHasPermission(false);
    }
    //startCamera();
  };

  useEffect(() => {
    connect();       // ✅ establish websocket session
    startCameras();   // ✅ request camera access
    console.log('isConnected',isConnected);
  
    return () => {
      stopAnalysis();
      stopCamera();
      disconnect();
    };
  }, [startCamera]);

  useEffect(() => {
    if (isConnected === true && !isAnalyzing) {
      startAnalysis();
    }
  }, [isConnected, isAnalyzing, startAnalysis]);
  
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);
  
  const exercise = exercises.find(ex => ex.id === params.id)
  
  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Exercise not found</h1>
          <p className="text-gray-600 mt-2">The exercise you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }
  
  const handleComplete = () => {
    // Simulate accuracy between 70-100%
    const accuracy = Math.floor(Math.random() * 31) + 70
    completeExercise(exercise.id, accuracy)
    setShowCompletion(true)
    
    // Hide completion after 3 seconds
    setTimeout(() => {
      setShowCompletion(false)
    }, 3000)
  }
  
  return (
    <div className="max-w-7xl max-h-screen mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-200">{exercise.title}</h1>
        <p className="text-gray-600 mt-2">{exercise.description}</p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-h-screen">
        {/* Video and feedback section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* <div className="relative w-full h-[480px] bg-gray-100 rounded-lg overflow-hidden">
            {!hasPermission ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">{error || 'Camera access required'}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Start Camera
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  backgroundColor: 'black'
                }}
                onLoadedMetadata={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.play().catch(console.error);
                }}
              />
            )}
            {error && (
              <div className="absolute top-2 left-2 right-2 bg-red-500 text-white px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {hasPermission ? 'Camera Active' : 'Camera Inactive'}
            </div>
          </div> */}

          <div className="relative w-full h-[720px] bg-gray-100 rounded-lg overflow-hidden">
            <PaperDoll landmarks={landmarks} />

            
            {!hasPermission && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50">
                <p className="text-gray-200">{error || 'Camera access required'}</p>
                <button
                  onClick={startCameras}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Start Camera
                </button>
              </div>
            )}

            {error && (
              <div className="absolute top-2 left-2 right-2 bg-red-500 text-white px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {hasPermission ? 'Camera Active' : 'Camera Inactive'}
            </div>
          </div>



        </motion.div>
        
        {/* Instructions and controls section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold text-gray-600 mb-4">Instructions</h2>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">Step {currentStep + 1} of {exercise.instructions.length}</div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="p-2 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-400" />
                </button>
                <button 
                  onClick={() => setIsPlaying(prev => !prev)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button 
                  onClick={() => setCurrentStep(prev => Math.min(exercise.instructions.length - 1, prev + 1))}
                  disabled={currentStep === exercise.instructions.length - 1}
                  className="p-2  rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5 text-gray-400 " />
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-blue-800">{exercise.instructions[currentStep]}</p>
            </div>
            
            <div className="flex space-x-2 mb-2">
              {exercise.instructions.map((_, index) => (
                <div 
                  key={index}
                  className={`h-2 flex-1 rounded-full ${index === currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-500">Sets</div>
              <div className="text-lg text-gray-800 font-semibold">{exercise.sets}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-500">Reps</div>
              <div className="text-lg text-gray-800 font-semibold">{exercise.reps}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-lg text-gray-800 font-semibold">{exercise.duration}s</div>
            </div>
          </div>
          
          <button 
            onClick={handleComplete}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Complete Exercise
          </button>
          
          <div className="rounded-full mt-5 w-auto h-auto">
            
            <video
              ref={videoRefs}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                backgroundColor: 'black'
              }}
            />
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}>

          <PoseFeedback
            success={success}
            score={score}
            is_correct={is_correct}
            exercise_name={exercise_name}
            feedback_messages={feedback_messages}
            audio_feedback={audio_feedback}
            annotated_frame={annotated_frame}
            individual_scores={individual_scores}
            landmarks={landmarks}
          />
 
        </motion.div>
      </div>
      
      {/* Completion Overlay */}
      {showCompletion && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-xl text-center max-w-md"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl text-gray-600 font-bold mb-2">Exercise Completed!</h3>
            <p className="text-gray-600 mb-4">Great job completing {exercise.title}!</p>
            <button 
              onClick={() => {
                window.location.href = "/patient/daily-progress";
                setShowCompletion(false);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Continue 
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}