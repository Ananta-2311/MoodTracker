interface YearSelectorProps {
  year: number
  onYearChange: (year: number) => void
  minYear?: number
  maxYear?: number
}

function YearSelector({ year, onYearChange, minYear, maxYear }: YearSelectorProps) {
  const currentYear = new Date().getFullYear()
  const defaultMinYear = minYear || currentYear - 10
  const defaultMaxYear = maxYear || currentYear + 1

  const handlePrevious = () => {
    if (year > defaultMinYear) {
      onYearChange(year - 1)
    }
  }

  const handleNext = () => {
    if (year < defaultMaxYear) {
      onYearChange(year + 1)
    }
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={handlePrevious}
        disabled={year <= defaultMinYear}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${year <= defaultMinYear
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500
        `}
        aria-label="Previous year"
      >
        ← Previous
      </button>
      
      <div className="px-6 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <span className="text-xl font-semibold text-gray-900 dark:text-white">{year}</span>
      </div>
      
      <button
        onClick={handleNext}
        disabled={year >= defaultMaxYear}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${year >= defaultMaxYear
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500
        `}
        aria-label="Next year"
      >
        Next →
      </button>
    </div>
  )
}

export default YearSelector

