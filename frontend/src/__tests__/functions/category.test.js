import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import {
  createCategory,
  removeCategory,
  getCategoryData,
} from '../../functions/category'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('category functions — all throw on failure', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('createCategory throws when API fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'))
    await expect(createCategory({ name: 'Work' })).rejects.toThrow()
  })

  it('removeCategory throws when API fails', async () => {
    axios.delete.mockRejectedValueOnce(new Error('Network error'))
    await expect(removeCategory('cat-id-123')).rejects.toThrow()
  })

  it('getCategoryData throws when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getCategoryData()).rejects.toThrow()
  })
})
