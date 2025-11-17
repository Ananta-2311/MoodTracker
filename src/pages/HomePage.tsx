import MoodPicker from '../components/MoodPicker'
import Heatmap from '../components/Heatmap'

function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Today's Mood</h2>
        <MoodPicker />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Mood History</h2>
        <Heatmap />
      </div>
    </div>
  )
}

export default HomePage

