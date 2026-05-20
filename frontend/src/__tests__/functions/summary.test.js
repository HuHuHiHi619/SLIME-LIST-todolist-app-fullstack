import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import {
  getSummaryTask,
  getSummaryTaskByCategory,
  getSummaryProgressRate,
  summaryNotification,
} from '../../functions/summary'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('summary functions — already throw on failure (no change needed)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getSummaryTask throws when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getSummaryTask()).rejects.toThrow()
  })

  it('getSummaryTaskByCategory throws when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getSummaryTaskByCategory()).rejects.toThrow()
  })

  it('getSummaryProgressRate throws when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getSummaryProgressRate('task-id-123')).rejects.toThrow()
  })

  it('summaryNotification throws when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(summaryNotification()).rejects.toThrow()
  })
})
