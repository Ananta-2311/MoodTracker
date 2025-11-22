import { useMemo, useState, useEffect } from 'react'
import { useMoodStore } from '../store/useMoodStore'
import { getMoodColor, getMoodHoverColor } from '../utils/moodColors'

type HeatmapCell = {
  date: Date
  label: string
  inYear: boolean
  mood: string | null
}

interface HeatmapProps {
  year?: number
  onCellClick?: (date: Date, event: React.MouseEvent<HTMLButtonElement>) => void
}

const WEEKS_IN_YEAR = 53
const DAYS_PER_WEEK = 7

const getDateKey = (date: Date) => date.toISOString().split('T')[0]

const generateHeatmapCells = (year: number, allMoods: Record<string, any>): HeatmapCell[] => {
  const cells: HeatmapCell[] = []
  const janFirst = new Date(year, 0, 1)
  const startDate = new Date(janFirst)
  startDate.setDate(janFirst.getDate() - janFirst.getDay()) // move back to Sunday

  for (let i = 0; i < WEEKS_IN_YEAR * DAYS_PER_WEEK; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateKey = getDateKey(date)
    cells.push({
      date,
      label: dateKey,
      inYear: date.getFullYear() === year,
      mood: allMoods[dateKey] || null,
    })
  }

  return cells
}

function Heatmap({ year = new Date().getFullYear(), onCellClick }: HeatmapProps) {
  const { getAllMoods } = useMoodStore()
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Listen for storage changes (updates from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'moodTracker_data') {
        setRefreshKey(prev => prev + 1)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  // Also refresh when window gets focus (user might have updated in another tab)
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1)
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])
  
  // Expose a refresh function that can be called after mood updates
  // This will be triggered by parent components when moods change
  useEffect(() => {
    // Create a custom event listener for manual refresh
    const handleRefresh = () => {
      setRefreshKey(prev => prev + 1)
    }
    window.addEventListener('moodUpdated', handleRefresh)
    return () => window.removeEventListener('moodUpdated', handleRefresh)
  }, [])

  const allMoods = getAllMoods()
  const cells = useMemo(() => generateHeatmapCells(year, allMoods), [year, allMoods, refreshKey])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mood Heatmap</h3>
        <span className="text-sm text-gray-500">{year}</span>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => {
            const baseColor = cell.inYear 
              ? getMoodColor(cell.mood)
              : 'bg-gray-100'
            const hoverColor = cell.inYear
              ? getMoodHoverColor(cell.mood)
              : 'hover:bg-gray-200'
            
            return (
              <button
                type="button"
                key={cell.label}
                onClick={(e) => onCellClick?.(cell.date, e)}
                className={`
                  w-4 h-4 rounded-sm
                  ${baseColor}
                  ${hoverColor}
                  transition-all duration-300 ease-in-out
                  transform hover:scale-110 active:scale-95
                  ${!cell.inYear ? 'opacity-60' : 'opacity-100'}
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
                  cursor-pointer
                `}
                aria-label={`Mood entry for ${cell.label}${cell.mood ? `: ${cell.mood}` : ''}`}
                title={cell.inYear ? `${cell.label}${cell.mood ? ` - ${cell.mood}` : ' - No mood recorded'}` : ''}
              />
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">Tap any cell to record or view a mood.</p>
    </div>
  )
}

export default Heatmap

