import { useState, useRef, useEffect } from 'react'
import MoodPicker, { type MoodOption } from '../components/MoodPicker'
import Heatmap from '../components/Heatmap'
import YearSelector from '../components/YearSelector'
import { useMoodStore, type MoodData } from '../store/useMoodStore'
import { getMoodsFromBackend, pushMoodsToBackend, checkBackendHealth } from '../utils/api'

interface PickerPosition {
  x: number
  y: number
}

function HomePage() {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [pickerPosition, setPickerPosition] = useState<PickerPosition | null>(null)
  const [activeYear, setActiveYear] = useState(new Date().getFullYear())
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setMood, getMood, getAllMoods, importMoods } = useMoodStore()
  const todayMood = getMood()

  // Check backend availability on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendAvailable).catch(() => setBackendAvailable(false))
  }, [])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

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

  const handleExportData = () => {
    try {
      const allMoods = getAllMoods()
      const dataStr = JSON.stringify(allMoods, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mood-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showMessage('success', 'Data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      showMessage('error', 'Failed to export data. Please try again.')
    }
  }

  const handleImportData = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data: MoodData = JSON.parse(text)

        // Validate and import
        importMoods(data, false) // Replace all data
        showMessage('success', 'Data imported successfully!')
        
        // Trigger refresh
        window.dispatchEvent(new Event('moodUpdated'))
      } catch (error) {
        console.error('Import error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Invalid file format'
        showMessage('error', `Failed to import data: ${errorMessage}`)
      } finally {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.onerror = () => {
      showMessage('error', 'Failed to read file. Please try again.')
    }
    reader.readAsText(file)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // First check if backend is available
      const isAvailable = await checkBackendHealth()
      if (!isAvailable) {
        showMessage('error', 'Backend server is not available. Make sure it\'s running on http://localhost:8000')
        setBackendAvailable(false)
        setIsSyncing(false)
        return
      }
      setBackendAvailable(true)

      // Pull data from backend
      const backendMoods = await getMoodsFromBackend()
      const localMoods = getAllMoods()

      // Merge: backend takes precedence if both exist, otherwise keep local
      const mergedMoods: MoodData = { ...localMoods, ...backendMoods }

      // Push merged data to backend
      await pushMoodsToBackend(mergedMoods)

      // Update local storage with merged data
      importMoods(mergedMoods, false)

      showMessage('success', 'Data synced successfully!')
      
      // Trigger refresh
      window.dispatchEvent(new Event('moodUpdated'))
    } catch (error) {
      console.error('Sync error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync data'
      showMessage('error', `Sync failed: ${errorMessage}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePushToBackend = async () => {
    setIsSyncing(true)
    try {
      const isAvailable = await checkBackendHealth()
      if (!isAvailable) {
        showMessage('error', 'Backend server is not available. Make sure it\'s running on http://localhost:8000')
        setBackendAvailable(false)
        setIsSyncing(false)
        return
      }
      setBackendAvailable(true)

      const localMoods = getAllMoods()
      await pushMoodsToBackend(localMoods)
      showMessage('success', 'Data pushed to backend successfully!')
    } catch (error) {
      console.error('Push error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to push data'
      showMessage('error', `Push failed: ${errorMessage}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePullFromBackend = async () => {
    setIsSyncing(true)
    try {
      const isAvailable = await checkBackendHealth()
      if (!isAvailable) {
        showMessage('error', 'Backend server is not available. Make sure it\'s running on http://localhost:8000')
        setBackendAvailable(false)
        setIsSyncing(false)
        return
      }
      setBackendAvailable(true)

      const backendMoods = await getMoodsFromBackend()
      importMoods(backendMoods, false)
      showMessage('success', 'Data pulled from backend successfully!')
      
      // Trigger refresh
      window.dispatchEvent(new Event('moodUpdated'))
    } catch (error) {
      console.error('Pull error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to pull data'
      showMessage('error', `Pull failed: ${errorMessage}`)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`
            fixed top-20 left-1/2 transform -translate-x-1/2 z-50
            px-6 py-4 rounded-lg shadow-lg
            flex items-center gap-3
            animate-in fade-in slide-in-from-top-5
            ${message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
            }
          `}
        >
          <span className="text-xl">
            {message.type === 'success' ? '✓' : '✕'}
          </span>
          <span className="font-medium">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-2 text-current opacity-70 hover:opacity-100"
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Today's Mood</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPicker(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {todayMood ? `Update Mood (${todayMood})` : 'Select Mood'}
          </button>
          {todayMood && (
            <span className="text-lg text-gray-700 dark:text-gray-300">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mood History</h2>
        </div>
        <div className="mb-8">
          <YearSelector 
            year={activeYear} 
            onYearChange={setActiveYear}
          />
        </div>
        <Heatmap year={activeYear} onCellClick={handleCellClick} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Data Management</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Backup your mood data or restore from a previous backup.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExportData}
            className="
              bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
              text-white font-medium px-6 py-3 rounded-xl
              transition-all duration-200 transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            "
          >
            📥 Export Data
          </button>
          <button
            onClick={handleImportData}
            className="
              bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
              text-white font-medium px-6 py-3 rounded-xl
              transition-all duration-200 transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            "
          >
            📤 Import Data
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Import mood data file"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Backend Sync</h2>
        <div className="flex items-center gap-2 mb-6">
          <div className={`
            w-3 h-3 rounded-full
            ${backendAvailable === null 
              ? 'bg-gray-400 dark:bg-gray-600' 
              : backendAvailable 
                ? 'bg-green-500' 
                : 'bg-red-500'
            }
          `} />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {backendAvailable === null 
              ? 'Checking backend status...' 
              : backendAvailable 
                ? 'Backend connected' 
                : 'Backend unavailable'}
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sync your mood data with the backend server. Sync merges local and remote data.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="
              bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600
              disabled:bg-gray-400 disabled:cursor-not-allowed
              text-white font-medium px-6 py-3 rounded-xl
              transition-all duration-200 transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
            "
          >
            {isSyncing ? '⏳ Syncing...' : '🔄 Sync (Push & Pull)'}
          </button>
          <button
            onClick={handlePushToBackend}
            disabled={isSyncing}
            className="
              bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
              disabled:bg-gray-400 disabled:cursor-not-allowed
              text-white font-medium px-6 py-3 rounded-xl
              transition-all duration-200 transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            "
          >
            {isSyncing ? '⏳ Pushing...' : '⬆️ Push to Backend'}
          </button>
          <button
            onClick={handlePullFromBackend}
            disabled={isSyncing}
            className="
              bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600
              disabled:bg-gray-400 disabled:cursor-not-allowed
              text-white font-medium px-6 py-3 rounded-xl
              transition-all duration-200 transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
            "
          >
            {isSyncing ? '⏳ Pulling...' : '⬇️ Pull from Backend'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage

