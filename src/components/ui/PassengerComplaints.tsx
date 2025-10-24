import { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { X } from 'lucide-react'

export default function PassengerComplaints() {
  const passengerComplaints = useGameStore(state => state.passengerComplaints)
  const lines = useGameStore(state => state.lines)

  // Auto-dismiss complaints after 5 seconds
  useEffect(() => {
    if (passengerComplaints.length > 0) {
      const timer = setTimeout(() => {
        useGameStore.setState({
          passengerComplaints: passengerComplaints.slice(1)
        })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [passengerComplaints])

  if (passengerComplaints.length === 0) return null

  // Show only the 3 most recent complaints
  const recentComplaints = passengerComplaints.slice(0, 3)

  const handleDismiss = (complaintId: string) => {
    useGameStore.setState({
      passengerComplaints: passengerComplaints.filter(c => c.id !== complaintId)
    })
  }

  return (
    <div className="fixed bottom-24 right-6 w-72 space-y-2 z-20">
      {recentComplaints.map((complaint) => {
        const line = lines.find(l => l.id === complaint.lineId)
        const isPositive = complaint.type === 'praise'

        return (
          <div
            key={complaint.id}
            className={`bg-[#1a1a1a] backdrop-blur-xl border-l-4 rounded-none shadow-xl p-2 animate-slide-in relative ${
              isPositive ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <div className="flex items-start space-x-2">
              <div className="text-lg">{complaint.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-normal leading-tight truncate">
                  "{complaint.message}"
                </p>
                <span className="text-gray-600 text-[9px]">
                  {line?.name || 'Unknown'}
                </span>
              </div>
              <button
                onClick={() => handleDismiss(complaint.id)}
                className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
