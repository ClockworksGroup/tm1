import { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle, Info, DollarSign } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: DollarSign,
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }

  const Icon = icons[type]

  const borderColors = {
    success: '#22c55e',
    error: '#c90a43',
    info: '#3b82f6',
    warning: '#eab308',
  }

  return (
    <div
      className={`fixed top-24 right-6 z-[9999] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      <div 
        className="bg-[#1a1a1a] backdrop-blur-xl border-l-4 rounded-none shadow-2xl overflow-hidden min-w-[320px] max-w-[400px]"
        style={{ borderLeftColor: borderColors[type] }}
      >
        <div className="p-4 flex items-start space-x-3">
          <div className={`${colors[type]} rounded-full p-1.5 flex-shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-white font-normal text-sm leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="text-gray-500 hover:text-white transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
