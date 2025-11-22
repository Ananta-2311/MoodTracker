import { useState } from 'react'
import MoodPicker, { type MoodOption } from '../components/MoodPicker'
import Heatmap from '../components/Heatmap'
import { useMoodStore } from '../store/useMoodStore'

interface PickerPosition {
  x: number
  y: number
}

function HomePage() {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [pickerPosition, setPickerPosition] = useState<PickerPosition | null>(null)
  const { setMood, getMood } = useMoodStore()
  const todayMood = getMood()

  const handleMoodSelect = (mood: MoodOption) => {
    if (selectedDate) {
      setMood(mood, selectedDate)
    } else {
      setMood(mood) // Default to today if no date selected
    }
    setShowPicker(false)
    setSelectedDate(null)
    setPickerPosition(null)
    // Trigger heatmap refresh
    window.dispatchEvent(new Event('moodUpdated'))
  }

  const handleCellClick = (date: Date, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPickerPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    setSelectedDate(date)
    setShowPicker(true)
  }

  const handleClosePicker = () => {
    setShowPicker(false)
    setSelectedDate(null)
    setPickerPosition(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Today's Mood</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPicker(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            {todayMood ? `Update Mood (${todayMood})` : 'Select Mood'}
          </button>
          {todayMood && (
            <span className="text-lg text-gray-700">
              Current: <span className="font-semibold">{todayMood}</span>
            </span>
          )}
        </div>
        <MoodPicker
          isOpen={showPicker}
          onSelect={handleMoodSelect}
          onClose={handleClosePicker}
          position={pickerPosition}
        />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Mood History</h2>
        <Heatmap onCellClick={handleCellClick} />
      </div>
    </div>
  )
}

export default HomePage

