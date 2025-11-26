import { describe, it, expect } from 'vitest'

// Extract the function for testing
const WEEKS_IN_YEAR = 53
const DAYS_PER_WEEK = 7

const getDateKey = (date: Date) => date.toISOString().split('T')[0]

const generateHeatmapCells = (year: number, allMoods: Record<string, any>) => {
  const cells: Array<{ date: Date; label: string; inYear: boolean; mood: string | null }> = []
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

describe('Heatmap Date Generation', () => {
  it('should generate correct number of cells', () => {
    const cells = generateHeatmapCells(2024, {})
    expect(cells.length).toBe(WEEKS_IN_YEAR * DAYS_PER_WEEK)
  })

  it('should start from Sunday before January 1st', () => {
    const cells = generateHeatmapCells(2024, {})
    const firstCell = cells[0]
    expect(firstCell.date.getDay()).toBe(0) // Sunday
  })

  it('should include all days of the year', () => {
    const cells = generateHeatmapCells(2024, {})
    const yearCells = cells.filter(cell => cell.inYear)
    
    // 2024 is a leap year, so 366 days
    expect(yearCells.length).toBe(366)
  })

  it('should correctly mark cells as in-year or out-of-year', () => {
    const cells = generateHeatmapCells(2024, {})
    
    // First few cells might be from previous year
    const firstInYear = cells.find(cell => cell.inYear)
    expect(firstInYear).toBeDefined()
    expect(firstInYear?.date.getFullYear()).toBe(2024)
    
    // Last few cells might be from next year
    const lastInYear = cells.filter(cell => cell.inYear).pop()
    expect(lastInYear).toBeDefined()
    expect(lastInYear?.date.getFullYear()).toBe(2024)
  })

  it('should generate correct date keys in YYYY-MM-DD format', () => {
    const cells = generateHeatmapCells(2024, {})
    
    cells.forEach(cell => {
      expect(cell.label).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('should assign moods correctly to cells', () => {
    const moods = {
      '2024-01-15': 'great',
      '2024-01-16': 'good',
      '2024-06-20': 'neutral',
    }
    
    const cells = generateHeatmapCells(2024, moods)
    
    const cellJan15 = cells.find(cell => cell.label === '2024-01-15')
    expect(cellJan15?.mood).toBe('great')
    
    const cellJan16 = cells.find(cell => cell.label === '2024-01-16')
    expect(cellJan16?.mood).toBe('good')
    
    const cellJun20 = cells.find(cell => cell.label === '2024-06-20')
    expect(cellJun20?.mood).toBe('neutral')
  })

  it('should handle non-leap years correctly', () => {
    const cells = generateHeatmapCells(2023, {})
    const yearCells = cells.filter(cell => cell.inYear)
    
    // 2023 is not a leap year, so 365 days
    expect(yearCells.length).toBe(365)
  })

  it('should handle leap years correctly', () => {
    const cells = generateHeatmapCells(2024, {})
    const yearCells = cells.filter(cell => cell.inYear)
    
    // 2024 is a leap year, so 366 days
    expect(yearCells.length).toBe(366)
  })

  it('should generate sequential dates', () => {
    const cells = generateHeatmapCells(2024, {})
    
    for (let i = 1; i < cells.length; i++) {
      const prevDate = new Date(cells[i - 1].date)
      prevDate.setDate(prevDate.getDate() + 1)
      
      const currentDate = new Date(cells[i].date)
      expect(currentDate.getTime()).toBe(prevDate.getTime())
    }
  })
})

