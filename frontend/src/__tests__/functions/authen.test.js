import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import {
  register,
  userLogin,
  userLogout,
  getUserData,
  getRefreshToken,
} from '../../functions/authen'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('authen functions — already throw on failure (no change needed)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('register throws when API fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'))
    await expect(register({ username: 'user', password: 'pass' })).rejects.toThrow()
  })

  it('userLogin throws when API fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'))
    await expect(userLogin({ username: 'user', password: 'pass' })).rejects.toThrow()
  })

  it('userLogout throws when API fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'))
    await expect(userLogout()).rejects.toThrow()
  })

  it('getUserData throws when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getUserData()).rejects.toThrow()
  })

  it('getRefreshToken throws when API fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'))
    await expect(getRefreshToken()).rejects.toThrow()
  })
})
