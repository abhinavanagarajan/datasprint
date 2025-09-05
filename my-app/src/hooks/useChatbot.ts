// hooks/useChatbot.ts
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  isTyping?: boolean
}

export interface ChatbotState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  isOpen: boolean
  hasNewMessage: boolean
}

export interface UseChatbotOptions {
  patientId?: string
  maxMessages?: number
  welcomeMessage?: string
}

export function useChatbot(options: UseChatbotOptions = {}) {
  const { patientId, maxMessages = 50, welcomeMessage } = options
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    error: null,
    isOpen: false,
    hasNewMessage: false
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with welcome message (only once)
  useEffect(() => {
    if (welcomeMessage && state.messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }
      setState(prev => ({
        ...prev,
        messages: [welcomeMsg]
      }))
    }
  }, [welcomeMessage]) // Remove state.messages.length dependency to prevent flickering

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && state.isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [state.messages, state.isOpen])

  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date().toISOString()
    }

    setState(prev => ({
      ...prev,
      messages: prev.messages.length >= maxMessages 
        ? [...prev.messages.slice(1), newMessage]
        : [...prev.messages, newMessage],
      hasNewMessage: !prev.isOpen && message.role === 'assistant'
    }))

    return newMessage
  }, [maxMessages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return

    // Add user message immediately
    const userMessage = addMessage({
      role: 'user',
      content: content.trim()
    })

    // Add typing indicator
    const typingMessage = addMessage({
      role: 'assistant',
      content: '...',
      isTyping: true
    })

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      // Prepare conversation history (exclude typing message)
      const conversationHistory = state.messages
        .filter(msg => !msg.isTyping)
        .slice(-10) // Last 10 messages for context
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }))

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory,
          patientId
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Remove typing indicator and add actual response
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== typingMessage.id),
        isLoading: false
      }))

      // Add bot response
      addMessage({
        role: 'assistant',
        content: data.message
      })

      if (data.error) {
        console.warn('Chatbot API warning:', data.error)
      }

    } catch (error: any) {
      // Remove typing indicator
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== typingMessage.id),
        isLoading: false
      }))

      if (error.name === 'AbortError') {
        return // Request was cancelled, don't show error
      }

      const errorMessage = error.message || 'Failed to send message'
      setState(prev => ({ ...prev, error: errorMessage }))

      // Add error message to chat with helpful information
      addMessage({
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. This might be due to network issues or server maintenance. Please try again in a moment, or feel free to ask me about your exercises, progress, or rehabilitation questions - I'll do my best to help! 🤖"
      })

      // Only show toast for unexpected errors, not network issues
      if (!errorMessage.includes('fetch') && !errorMessage.includes('network')) {
        toast.error('Chatbot temporarily unavailable')
      }
    }
  }, [state.isLoading, state.messages, addMessage, patientId])

  const openChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      hasNewMessage: false
    }))
  }, [])

  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const toggleChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      hasNewMessage: prev.isOpen ? prev.hasNewMessage : false
    }))
  }, [])

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: welcomeMessage ? [{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }] : [],
      error: null
    }))
  }, [welcomeMessage])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Quick action functions
  const sendQuickMessage = useCallback((message: string) => {
    sendMessage(message)
  }, [sendMessage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isOpen: state.isOpen,
    hasNewMessage: state.hasNewMessage,
    
    // Actions
    sendMessage,
    sendQuickMessage,
    openChat,
    closeChat,
    toggleChat,
    clearMessages,
    clearError,
    
    // Refs for scrolling
    messagesEndRef,
    
    // Quick actions
    quickActions: {
      showProgress: () => sendQuickMessage("Show me my recent progress and achievements"),
      getMotivation: () => sendQuickMessage("I need some motivation to keep going with my exercises"),
      exerciseTips: () => sendQuickMessage("Give me tips to improve my exercise form and accuracy"),
      todayGoals: () => sendQuickMessage("What should I focus on today for my recovery?"),
      askQuestion: () => sendQuickMessage("I have a question about my rehabilitation program")
    }
  }
}

// Predefined quick action messages
export const QUICK_ACTIONS = [
  {
    id: 'progress',
    label: '📈 My Progress',
    message: "Show me my recent progress and achievements"
  },
  {
    id: 'motivation',
    label: '💪 Motivation',
    message: "I need some motivation to keep going with my exercises"
  },
  {
    id: 'tips',
    label: '💡 Exercise Tips',
    message: "Give me tips to improve my exercise form and accuracy"
  },
  {
    id: 'goals',
    label: '🎯 Today\'s Goals',
    message: "What should I focus on today for my recovery?"
  },
  {
    id: 'exercises',
    label: '🏃‍♂️ Exercise Help',
    message: "Can you help me understand my assigned exercises better?"
  },
  {
    id: 'pain',
    label: '🩺 Pain Management',
    message: "I'm experiencing some discomfort during exercises. What should I know?"
  }
] as const
