// components/AIChatbot.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react'
import { useChatbot, QUICK_ACTIONS, ChatMessage } from '@/hooks/useChatbot'
import { Toaster } from 'react-hot-toast'

interface AIChatbotProps {
  patientId?: string
  className?: string
  position?: 'fixed' | 'relative'
  theme?: 'light' | 'dark'
}

const AIChatbot: React.FC<AIChatbotProps> = ({
  patientId,
  className = '',
  position = 'fixed',
  theme = 'light'
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const welcomeMessage = `👋 Hi! I'm Dr. RehabBot, your AI rehabilitation assistant. I'm here to help you with your recovery journey, answer questions about your exercises, provide motivation, and track your progress. How can I assist you today?`

  const {
    messages,
    isLoading,
    error,
    isOpen,
    hasNewMessage,
    sendMessage,
    sendQuickMessage,
    toggleChat,
    closeChat,
    clearMessages,
    clearError,
    messagesEndRef,
    quickActions
  } = useChatbot({ 
    patientId, 
    maxMessages: 100, 
    welcomeMessage 
  })

  // Auto-focus input when chat opens (debounced to prevent flickering)
  useEffect(() => {
    if (isOpen && inputRef.current && !isMinimized) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isMinimized])

  // Text-to-speech for bot messages (optional)
  const speakMessage = (text: string) => {
    if (audioEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.7
      speechSynthesis.speak(utterance)
    }
  }

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    await sendMessage(inputValue)
    setInputValue('')
    
    // Focus input after sending
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle quick action clicks
  const handleQuickAction = (message: string) => {
    sendQuickMessage(message)
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Message component with animations
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isBot = message.role === 'assistant'
    const isTyping = message.isTyping

    useEffect(() => {
      if (isBot && !isTyping && audioEnabled) {
        speakMessage(message.content)
      }
    }, [isBot, isTyping, message.content])

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.8 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`flex items-end max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isBot ? 'bg-gradient-to-br from-blue-500 to-purple-600 mr-3' : 'bg-gradient-to-br from-green-500 to-emerald-600 ml-3'
          }`}>
            {isBot ? (
              <Bot className="w-4 h-4 text-white" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>

          {/* Message bubble */}
          <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isBot 
              ? 'bg-white border border-gray-200 text-gray-800' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          }`}>
            {/* Message content */}
            {isTyping ? (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              <div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <div className={`text-xs mt-1 ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            )}

            {/* Message tail */}
            <div className={`absolute top-4 w-0 h-0 ${
              isBot 
                ? 'left-[-8px] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-white' 
                : 'right-[-8px] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-blue-500'
            }`}></div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!isOpen) {
    return (
      <>
        {/* Floating chat button */}
        <motion.button
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleChat}
          className={`${
            position === 'fixed' 
              ? 'fixed bottom-6 right-6 z-50' 
              : 'relative'
          } ${className} w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center group hover:shadow-2xl transition-all duration-300`}
        >
          {hasNewMessage && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
          <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
          <Sparkles className="w-3 h-3 text-yellow-300 absolute top-1 right-1 animate-pulse" />
        </motion.button>
      </>
    )
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            height: isMinimized ? 60 : 600
          }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className={`${
            position === 'fixed' 
              ? 'fixed bottom-6 right-6 z-50' 
              : 'relative'
          } ${className} w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Dr. RehabBot</h3>
                <p className="text-xs text-blue-100">Your AI Rehabilitation Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Audio toggle */}
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                title={audioEnabled ? 'Disable audio' : 'Enable audio'}
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Clear messages */}
              <button
                onClick={clearMessages}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Minimize/Maximize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>

              {/* Close */}
              <button
                onClick={closeChat}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main content - hidden when minimized */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-[520px]"
              >
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />

                  {/* Quick actions */}
                  {messages.length <= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6"
                    >
                      <p className="text-xs text-gray-500 mb-3 text-center">Quick actions to get started:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {QUICK_ACTIONS.slice(0, 6).map((action) => (
                          <button
                            key={action.id}
                            onClick={() => handleQuickAction(action.message)}
                            className="text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 hover:text-blue-600 transition-all duration-200 border border-gray-200 hover:border-blue-300"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Error display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                          onClick={clearError}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input area */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me about your rehabilitation..."
                        disabled={isLoading}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {isLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default AIChatbot
