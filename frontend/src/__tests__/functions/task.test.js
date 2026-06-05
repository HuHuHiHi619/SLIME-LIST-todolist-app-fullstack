import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import {
  createTask,
  getData,
  searchedTask,
  completeTask,
  updateTask,
  removeTask,
  removeAllCompletedTask,
} from '../../functions/task'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('task functions — all throw on failure', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('createTask throws when API fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'))
    await expect(createTask({ title: 'test' })).rejects.toThrow()
  })

  it('getData throws when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getData({})).rejects.toThrow()
  })

  it('searchedTask throws when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(searchedTask('test query')).rejects.toThrow()
  })

  it('completeTask throws when API fails', async () => {
    axios.patch.mockRejectedValueOnce(new Error('Network error'))
    await expect(completeTask('task-id-123')).rejects.toThrow()
  })

  it('updateTask throws when API fails', async () => {
    axios.put.mockRejectedValueOnce(new Error('Network error'))
    await expect(updateTask('task-id-123', { title: 'updated' })).rejects.toThrow()
  })

  it('removeTask throws when API fails', async () => {
    axios.delete.mockRejectedValueOnce(new Error('Network error'))
    await expect(removeTask('task-id-123')).rejects.toThrow()
  })

  it('removeAllCompletedTask throws when API fails', async () => {
    axios.delete.mockRejectedValueOnce(new Error('Network error'))
    await expect(removeAllCompletedTask()).rejects.toThrow()
  })
})
