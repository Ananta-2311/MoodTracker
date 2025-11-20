import { useMemo } from 'react'

type HeatmapCell = {
  date: Date
  label: string
  inYear: boolean
}

interface HeatmapProps {
  year?: number
  onCellClick?: (date: Date) => void
}

const WEEKS_IN_YEAR = 53
const DAYS_PER_WEEK = 7

const getDateKey = (date: Date) => date.toISOString().split('T')[0]

const generateHeatmapCells = (year: number): HeatmapCell[] => {
  const cells: HeatmapCell[] = []
  const janFirst = new Date(year, 0, 1)
  const startDate = new Date(janFirst)
  startDate.setDate(janFirst.getDate() - janFirst.getDay()) // move back to Sunday

  for (let i = 0; i < WEEKS_IN_YEAR * DAYS_PER_WEEK; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    cells.push({
      date,
      label: getDateKey(date),
      inYear: date.getFullYear() === year,
    })
  }

  return cells
}

function Heatmap({ year = new Date().getFullYear(), onCellClick }: HeatmapProps) {
  const cells = useMemo(() => generateHeatmapCells(year), [year])

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
          {cells.map((cell) => (
            <button
              type="button"
              key={cell.label}
              onClick={() => onCellClick?.(cell.date)}
              className={`w-4 h-4 rounded-sm transition-colors ${
                cell.inYear ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 opacity-60'
              } focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400`}
              aria-label={`Mood entry for ${cell.label}`}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">Tap any cell to record or view a mood.</p>
    </div>
  )
}

export default Heatmap

