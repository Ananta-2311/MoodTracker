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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

// Get month labels for the heatmap
const getMonthLabels = (year: number): Array<{ week: number; month: string }> => {
  const labels: Array<{ week: number; month: string }> = []
  const janFirst = new Date(year, 0, 1)
  const startDate = new Date(janFirst)
  startDate.setDate(janFirst.getDate() - janFirst.getDay()) // move back to Sunday

  let currentMonth = -1
  let weekIndex = 0

  for (let i = 0; i < WEEKS_IN_YEAR * DAYS_PER_WEEK; i += DAYS_PER_WEEK) {
    const weekStartDate = new Date(startDate)
    weekStartDate.setDate(startDate.getDate() + i)
    
    // Check if this week contains the first day of a month
    for (let day = 0; day < DAYS_PER_WEEK; day++) {
      const date = new Date(weekStartDate)
      date.setDate(weekStartDate.getDate() + day)
      
      if (date.getFullYear() === year && date.getDate() === 1) {
        const month = date.getMonth()
        if (month !== currentMonth) {
          labels.push({
            week: weekIndex,
            month: MONTHS[month],
          })
          currentMonth = month
        }
        break
      }
    }
    
    weekIndex++
  }

  return labels
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
  const monthLabels = useMemo(() => getMonthLabels(year), [year])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mood Heatmap</h3>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{year}</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="flex gap-2">
          {/* Weekday labels */}
          <div className="flex flex-col gap-1.5 pt-6">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className="h-4 flex items-center justify-end pr-2 text-xs font-medium text-gray-500 dark:text-gray-400"
                style={{ opacity: idx % 2 === 0 ? 1 : 0.5 }}
              >
                {idx % 2 === 0 ? day : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex-1">
            {/* Month labels */}
            <div
              className="grid gap-1.5 mb-2 relative h-6"
              style={{
                gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: WEEKS_IN_YEAR }, (_, weekIdx) => {
                const label = monthLabels.find(l => l.week === weekIdx)
                return (
                  <div
                    key={weekIdx}
                    className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center flex items-center justify-center"
                  >
                    {label ? label.month : ''}
                  </div>
                )
              })}
            </div>

            {/* Heatmap cells */}
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, minmax(0, 1fr))`,
              }}
            >
              {cells.map((cell) => {
                const baseColor = cell.inYear 
                  ? getMoodColor(cell.mood)
                  : 'bg-gray-100 dark:bg-gray-700'
                const hoverColor = cell.inYear
                  ? getMoodHoverColor(cell.mood)
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                
                return (
                  <button
                    type="button"
                    key={cell.label}
                    onClick={(e) => onCellClick?.(cell.date, e)}
                    className={`
                      w-4 h-4 rounded-md
                      ${baseColor}
                      ${hoverColor}
                      transition-all duration-500 ease-in-out
                      transition-colors duration-300 ease-in-out
                      transform hover:scale-125 active:scale-95
                      ${!cell.inYear ? 'opacity-60' : 'opacity-100'}
                      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500
                      cursor-pointer
                    `}
                    aria-label={`Mood entry for ${cell.label}${cell.mood ? `: ${cell.mood}` : ''}`}
                    title={cell.inYear ? `${cell.label}${cell.mood ? ` - ${cell.mood}` : ' - No mood recorded'}` : ''}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <p>Tap any cell to record or view a mood.</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            <span>No data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-md bg-emerald-600 dark:bg-emerald-500"></div>
            <span>Great</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-md bg-blue-500 dark:bg-blue-400"></div>
            <span>Good</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Heatmap

