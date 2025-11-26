import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMoodStore } from './useMoodStore'
import type { MoodData } from './useMoodStore'

const STORAGE_KEY = 'moodTracker_data'

describe('useMoodStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('setMood', () => {
    it('should set a mood for today', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        const success = result.current.setMood('great')
        expect(success).toBe(true)
      })

      const today = new Date().toISOString().split('T')[0]
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored[today]).toBe('great')
    })

    it('should set a mood for a specific date string', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        result.current.setMood('good', '2024-01-15')
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored['2024-01-15']).toBe('good')
    })

    it('should set a mood for a specific Date object', () => {
      const { result } = renderHook(() => useMoodStore())
      const date = new Date('2024-01-20')
      
      act(() => {
        result.current.setMood('neutral', date)
      })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored['2024-01-20']).toBe('neutral')
    })

    it('should reject invalid mood values', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        const success = result.current.setMood('' as any)
        expect(success).toBe(false)
      })

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toBeNull()
    })

    it('should reject null mood values', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        const success = result.current.setMood(null as any)
        expect(success).toBe(false)
      })
    })
  })

  describe('getMood', () => {
    it('should get a mood for today', () => {
      const { result } = renderHook(() => useMoodStore())
      const today = new Date().toISOString().split('T')[0]
      
      act(() => {
        result.current.setMood('great')
      })

      act(() => {
        const mood = result.current.getMood()
        expect(mood).toBe('great')
      })
    })

    it('should get a mood for a specific date', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        result.current.setMood('good', '2024-01-15')
      })

      act(() => {
        const mood = result.current.getMood('2024-01-15')
        expect(mood).toBe('good')
      })
    })

    it('should return null for non-existent mood', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        const mood = result.current.getMood('2024-12-31')
        expect(mood).toBeNull()
      })
    })
  })

  describe('getAllMoods', () => {
    it('should return all moods', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        result.current.setMood('great', '2024-01-15')
        result.current.setMood('good', '2024-01-16')
        result.current.setMood('neutral', '2024-01-17')
      })

      act(() => {
        const allMoods = result.current.getAllMoods()
        expect(allMoods).toEqual({
          '2024-01-15': 'great',
          '2024-01-16': 'good',
          '2024-01-17': 'neutral',
        })
      })
    })

    it('should return empty object when no moods exist', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        const allMoods = result.current.getAllMoods()
        expect(allMoods).toEqual({})
      })
    })
  })

  describe('clearMoods', () => {
    it('should clear all moods', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        result.current.setMood('great', '2024-01-15')
        result.current.setMood('good', '2024-01-16')
      })

      act(() => {
        const success = result.current.clearMoods()
        expect(success).toBe(true)
      })

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toBeNull()

      act(() => {
        const allMoods = result.current.getAllMoods()
        expect(allMoods).toEqual({})
      })
    })
  })

  describe('importMoods', () => {
    it('should import valid mood data', () => {
      const { result } = renderHook(() => useMoodStore())
      const data: MoodData = {
        '2024-01-15': 'great',
        '2024-01-16': 'good',
        '2024-01-17': 'neutral',
      }

      act(() => {
        const success = result.current.importMoods(data, false)
        expect(success).toBe(true)
      })

      act(() => {
        const allMoods = result.current.getAllMoods()
        expect(allMoods).toEqual(data)
      })
    })

    it('should merge imported data when merge is true', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        result.current.setMood('great', '2024-01-15')
      })

      const newData: MoodData = {
        '2024-01-16': 'good',
        '2024-01-17': 'neutral',
      }

      act(() => {
        result.current.importMoods(newData, true)
      })

      act(() => {
        const allMoods = result.current.getAllMoods()
        expect(allMoods).toEqual({
          '2024-01-15': 'great',
          '2024-01-16': 'good',
          '2024-01-17': 'neutral',
        })
      })
    })

    it('should replace data when merge is false', () => {
      const { result } = renderHook(() => useMoodStore())
      
      act(() => {
        result.current.setMood('great', '2024-01-15')
      })

      const newData: MoodData = {
        '2024-01-16': 'good',
      }

      act(() => {
        result.current.importMoods(newData, false)
      })

      act(() => {
        const allMoods = result.current.getAllMoods()
        expect(allMoods).toEqual(newData)
        expect(allMoods['2024-01-15']).toBeUndefined()
      })
    })

    it('should reject invalid date format', () => {
      const { result } = renderHook(() => useMoodStore())
      const invalidData: MoodData = {
        'invalid-date': 'great',
      } as any

      expect(() => {
        act(() => {
          result.current.importMoods(invalidData, false)
        })
      }).toThrow()
    })

    it('should reject invalid mood values', () => {
      const { result } = renderHook(() => useMoodStore())
      const invalidData: MoodData = {
        '2024-01-15': '',
      } as any

      expect(() => {
        act(() => {
          result.current.importMoods(invalidData, false)
        })
      }).toThrow()
    })

    it('should reject non-object data', () => {
      const { result } = renderHook(() => useMoodStore())

      expect(() => {
        act(() => {
          result.current.importMoods([] as any, false)
        })
      }).toThrow()
    })
  })
})

