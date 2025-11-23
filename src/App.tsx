import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StatsPage from './pages/StatsPage'

function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
          <div className="flex gap-4">
            <Link
              to="/"
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${isActive('/')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              Home
            </Link>
            <Link
              to="/stats"
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${isActive('/stats')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              Stats
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

