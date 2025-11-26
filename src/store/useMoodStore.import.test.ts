import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMoodStore } from './useMoodStore'
import type { MoodData } from './useMoodStore'

describe('JSON Import Validation', () => {
  it('should validate and import correct JSON structure', () => {
    const { result } = renderHook(() => useMoodStore())
    const validData: MoodData = {
      '2024-01-15': 'great',
      '2024-01-16': 'good',
      '2024-01-17': 'neutral',
    }

    act(() => {
      const success = result.current.importMoods(validData, false)
      expect(success).toBe(true)
    })

    act(() => {
      const allMoods = result.current.getAllMoods()
      expect(allMoods).toEqual(validData)
    })
  })

  it('should reject JSON with invalid date format', () => {
    const { result } = renderHook(() => useMoodStore())
    const invalidData = {
      '2024/01/15': 'great', // Wrong format
      '01-15-2024': 'good', // Wrong format
      '2024-1-15': 'neutral', // Missing padding
    } as any

    expect(() => {
      act(() => {
        result.current.importMoods(invalidData, false)
      })
    }).toThrow()
  })

  it('should reject JSON with invalid dates', () => {
    const { result } = renderHook(() => useMoodStore())
    const invalidData = {
      '2024-13-01': 'great', // Invalid month
      '2024-02-30': 'good', // Invalid day
      '2024-00-15': 'neutral', // Invalid month
    } as any

    expect(() => {
      act(() => {
        result.current.importMoods(invalidData, false)
      })
    }).toThrow()
  })

  it('should reject JSON with empty mood values', () => {
    const { result } = renderHook(() => useMoodStore())
    const invalidData: MoodData = {
      '2024-01-15': '',
      '2024-01-16': null as any,
      '2024-01-17': undefined as any,
    }

    expect(() => {
      act(() => {
        result.current.importMoods(invalidData, false)
      })
    }).toThrow()
  })

  it('should reject non-object JSON', () => {
    const { result } = renderHook(() => useMoodStore())

    expect(() => {
      act(() => {
        result.current.importMoods([] as any, false)
      })
    }).toThrow()

    expect(() => {
      act(() => {
        result.current.importMoods('string' as any, false)
      })
    }).toThrow()

    expect(() => {
      act(() => {
        result.current.importMoods(123 as any, false)
      })
    }).toThrow()
  })

  it('should accept valid mood values (strings and numbers)', () => {
    const { result } = renderHook(() => useMoodStore())
    const validData: MoodData = {
      '2024-01-15': 'great',
      '2024-01-16': 'good',
      '2024-01-17': 5, // Number is valid
    }

    act(() => {
      const success = result.current.importMoods(validData, false)
      expect(success).toBe(true)
    })
  })

  it('should handle large JSON imports', () => {
    const { result } = renderHook(() => useMoodStore())
    const largeData: MoodData = {}
    
    // Generate a year's worth of data
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 28; day++) {
        const date = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        largeData[date] = 'neutral'
      }
    }

    act(() => {
      const success = result.current.importMoods(largeData, false)
      expect(success).toBe(true)
    })

    act(() => {
      const allMoods = result.current.getAllMoods()
      expect(Object.keys(allMoods).length).toBeGreaterThan(300)
    })
  })
})

