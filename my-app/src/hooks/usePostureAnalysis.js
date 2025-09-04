import { useState, useRef, useCallback, useEffect } from 'react';

// Custom hook for posture analysis
export const usePostureAnalysis = (serverUrl = 'ws://localhost:8000') => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentExercise, setCurrentExercise] = useState('');
  const [availableExercises, setAvailableExercises] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [errors, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [success, setSuccess] = useState(null)
  const [score, setScore] = useState(0)
  const [is_correct, setIsCorrect] = useState(null)
  const [exercise_name, setExerciseName] = useState('')
  const [feedback_messages, setFeedbackMessages] = useState([])
  const [audio_feedback, setAudioFeedback] = useState(null)
  const [annotated_frame, setAnnotatedFrame] = useState('')
  const [individual_scores, setIndividualScores] = useState({})
  
  
  const wsRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const analysisIntervalRef = useRef(null);

  // Text-to-speech function
  const speakFeedback = useCallback((text) => {
    if ('speechSynthesis' in window && text) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Enhanced') ||
        voice.lang === 'en-US'
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initialize WebSocket connection
  const connect = useCallback(async () => {
    try {
      // Create session first
      const response = await fetch(`${serverUrl.replace('ws://', 'http://')}/session`, {
        method: 'POST',
      });
      const sessionData = await response.json();
      const newSessionId = sessionData.session_id;
      
      setSessionId(newSessionId);
      
      // Connect WebSocket
      const ws = new WebSocket(`${serverUrl}/ws/${newSessionId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', errors);
        setError('Connection error. Please try again.');
        setIsConnected(false);
      };
      
      wsRef.current = ws;
      
    } catch (error) {
      console.error('Failed to connect:', errors);
      setError('Failed to connect to server');
    }
  }, [serverUrl]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    const { type, data } = message;
    //console.log('Received message:', message);
    const imgbase = message.data.annotated_frame;
    setImageSrc(imgbase);
    setLandmarks(message.data.landmarks);

    setSuccess(message.data.success)
    setScore(message.data.score)
    setIsCorrect(message.data.is_correct)
    setExerciseName(message.data.exercise_name)
    setFeedbackMessages(message.data.feedback_messages)
    setAudioFeedback(message.data.audio_feedback)
    setAnnotatedFrame(message.data.annotated_frame)
    setIndividualScores(message.data.individual_scores)


    switch (type) {
      case 'session_info':
        setAvailableExercises(data.exercises);
        setCurrentExercise(data.current_exercise);
        break;
        
      case 'analysis_result':
        if (data.success) {
          setLastResult(data);
          // Speak audio feedback if provided
          if (data.audio_feedback) {
            speakFeedback(data.audio_feedback);
          }
        } else {
          setError(data.error || 'Analysis failed');
        }
        break;
        
      case 'exercise_changed':
        if (data.success) {
          setCurrentExercise(data.current_exercise);
          speakFeedback(`Now performing ${data.current_exercise}`);
        } else {
          setError(data.message);
        }
        break;
        
      case 'exercises_list':
        setAvailableExercises(data.exercises);
        setCurrentExercise(data.current_exercise);
        break;
        
      case 'error':
        setError(data.error);
        console.error('Server error:', data.error);
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  }, [speakFeedback]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      return stream;
    } catch (errors) {
      console.error('Camera access failed:', errors);
      setError('Camera access denied. Please allow camera access.');
      throw errors;
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture frame from video
  const captureFrame = useCallback(() => {
      if (!videoRef.current || !canvasRef.current) {
        console.warn('Video or canvas ref not available',videoRef.current);
        return null;
      }
      //console.log('Capturing frame');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Send frame for analysis
  const analyzeFrame = useCallback(() => {
    //console.log('Analyzing frame');
    if (!wsRef.current || !isConnected) return;
    
    const frameData = captureFrame();
    if (!frameData) return;
    
    const message = {
      type: 'frame',
      data: {
        frame: frameData
      }
    };
    //console.log('Sending frame for analysis',message);
    wsRef.current.send(JSON.stringify(message));
  }, [isConnected, captureFrame]);

  // Start real-time analysis
  const startAnalysis = useCallback(() => {
    //console.log('Starting analysis');
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    
    setIsAnalyzing(true);
    analysisIntervalRef.current = setInterval(analyzeFrame, 100); // 10 FPS
  }, [analyzeFrame]);

  // Stop real-time analysis
  const stopAnalysis = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    setIsAnalyzing(false);
  }, []);

  // Change exercise
  const changeExercise = useCallback((exerciseName) => {
    if (!wsRef.current || !isConnected) return;
    
    const message = {
      type: 'change_exercise',
      data: {
        exercise_name: exerciseName
      }
    };
    
    wsRef.current.send(JSON.stringify(message));
  }, [isConnected]);

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    stopAnalysis();
    stopCamera();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setSessionId(null);
    window.speechSynthesis.cancel(); // Stop any ongoing speech
  }, [stopAnalysis, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
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
    
    // Refs for components
    videoRef,
    canvasRef,
    
    // Actions
    connect,
    disconnect,
    startCamera,
    stopCamera,
    startAnalysis,
    stopAnalysis,
    changeExercise,
    analyzeFrame,
    speakFeedback,
    
    // Clear error
    clearError: () => setError(null)
  };
};