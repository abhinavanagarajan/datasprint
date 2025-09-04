'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'

interface InjuryReportUploadProps {
  onUpload: (file: File) => void
  isUploading?: boolean
}

export default function InjuryReportUpload({ onUpload, isUploading = false }: InjuryReportUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setError('')
    
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file only')
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    
    setUploadedFile(file)
    onUpload(file)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive 
            ? 'border-cyan-400 bg-cyan-400/10' 
            : uploadedFile 
            ? 'border-green-400 bg-green-400/10' 
            : 'border-cyan-400/50 bg-slate-800/50 hover:border-cyan-400 hover:bg-cyan-400/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
        />
        
        {!uploadedFile ? (
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-cyan-400/50 flex items-center justify-center">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              {dragActive && (
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-cyan-400/20 animate-pulse" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-cyan-300">
                Upload Your Injury Report
              </h3>
              <p className="text-blue-200">
                Drag and drop your medical report (PDF) here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Maximum file size: 10MB • PDF format only
              </p>
            </div>
            
            <button
              onClick={onButtonClick}
              disabled={isUploading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Processing...' : 'Browse Files'}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white">{uploadedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <button
                onClick={removeFile}
                className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <motion.div 
          className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-300 text-sm">Analyzing your injury report...</p>
        </motion.div>
      )}
    </div>
  )
}
