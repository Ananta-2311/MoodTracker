import { useMemo } from 'react'
import { useMoodStore } from '../store/useMoodStore'
import { type MoodOption } from '../components/MoodPicker'

// Mood value to number mapping for calculations
const moodToNumber: Record<MoodOption, number> = {
  terrible: 1,
  bad: 2,
  neutral: 3,
  good: 4,
  great: 5,
}

// Good moods (for percentage calculation)
const goodMoods: MoodOption[] = ['great', 'good']

function StatsPage() {
  const { getAllMoods } = useMoodStore()
  const allMoods = getAllMoods()

  const stats = useMemo(() => {
    const entries = Object.entries(allMoods)
    const totalEntries = entries.length

    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        longestStreak: 0,
        currentStreak: 0,
        goodDaysPercentage: 0,
      }
    }

    // Calculate average mood
    const moodValues: number[] = []
    let goodDaysCount = 0

    entries.forEach(([_, mood]) => {
      const moodStr = String(mood).toLowerCase() as MoodOption
      if (moodStr in moodToNumber) {
        moodValues.push(moodToNumber[moodStr])
        if (goodMoods.includes(moodStr)) {
          goodDaysCount++
        }
      }
    })

    const averageMood = moodValues.length > 0
      ? moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length
      : 0

    const goodDaysPercentage = totalEntries > 0
      ? (goodDaysCount / totalEntries) * 100
      : 0

    // Calculate streaks
    const sortedDates = entries
      .map(([date]) => date)
      .sort()
      .map(date => new Date(date))

    let longestStreak = 0
    let currentStreak = 0
    let tempStreak = 1

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1]
      const currDate = sortedDates[i]
      
      // Check if dates are consecutive
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Calculate current streak (from today backwards)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let checkDate = new Date(today)
    let streakCount = 0
    
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0]
      if (allMoods[dateKey]) {
        streakCount++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    currentStreak = streakCount

    return {
      totalEntries,
      averageMood: Math.round(averageMood * 10) / 10, // Round to 1 decimal
      longestStreak,
      currentStreak,
      goodDaysPercentage: Math.round(goodDaysPercentage * 10) / 10, // Round to 1 decimal
    }
  }, [allMoods])

  const getMoodLabel = (value: number): string => {
    if (value >= 4.5) return 'Great'
    if (value >= 3.5) return 'Good'
    if (value >= 2.5) return 'Neutral'
    if (value >= 1.5) return 'Bad'
    return 'Terrible'
  }

  const StatCard = ({ title, value, subtitle, icon }: {
    title: string
    value: string | number
    subtitle?: string
    icon?: string
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-4xl text-gray-300 dark:text-gray-600">{icon}</div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Mood Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Entries"
            value={stats.totalEntries}
            subtitle="Mood records tracked"
            icon="📊"
          />
          
          <StatCard
            title="Average Mood"
            value={`${stats.averageMood.toFixed(1)}`}
            subtitle={stats.averageMood > 0 ? getMoodLabel(stats.averageMood) : 'No data'}
            icon="📈"
          />
          
          <StatCard
            title="Current Streak"
            value={stats.currentStreak}
            subtitle="Consecutive days"
            icon="🔥"
          />
          
          <StatCard
            title="Longest Streak"
            value={stats.longestStreak}
            subtitle="Best consecutive days"
            icon="⭐"
          />
          
          <StatCard
            title="Good Days"
            value={`${stats.goodDaysPercentage}%`}
            subtitle="Great or Good moods"
            icon="😊"
          />
        </div>
      </div>

      {stats.totalEntries === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            No mood data yet. Start tracking your moods to see statistics!
          </p>
        </div>
      )}
    </div>
  )
}

export default StatsPage

