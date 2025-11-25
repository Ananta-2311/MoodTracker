import axios from 'axios'
import { type MoodData } from '../store/useMoodStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ApiResponse<T> {
  message?: string
  data?: T
  moods?: T
  count?: number
}

/**
 * Get all moods from the backend
 */
export async function getMoodsFromBackend(): Promise<MoodData> {
  try {
    const response = await api.get<ApiResponse<MoodData>>('/api/moods')
    return response.data.moods || {}
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch moods from backend')
    }
    throw new Error('Failed to fetch moods from backend')
  }
}

/**
 * Push all moods to the backend
 */
export async function pushMoodsToBackend(moods: MoodData): Promise<void> {
  try {
    await api.post<ApiResponse<MoodData>>('/api/moods', { moods })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to push moods to backend')
    }
    throw new Error('Failed to push moods to backend')
  }
}

/**
 * Clear all moods on the backend
 */
export async function clearMoodsOnBackend(): Promise<void> {
  try {
    await api.delete<ApiResponse<void>>('/api/moods')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to clear moods on backend')
    }
    throw new Error('Failed to clear moods on backend')
  }
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await api.get('/')
    return response.status === 200
  } catch {
    return false
  }
}

