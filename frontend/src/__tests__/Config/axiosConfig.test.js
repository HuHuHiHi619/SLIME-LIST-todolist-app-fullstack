import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

// Hoist mocks before axiosConfig.js is imported so the module gets spies,
// not the real store/action creator.
vi.mock('../../redux/store', () => ({ default: { dispatch: vi.fn() } }))
vi.mock('../../redux/userSlice', () => ({
  logoutUser: vi.fn(() => ({ type: 'user/logoutUser' })),
}))

import store from '../../redux/store'
import { logoutUser } from '../../redux/userSlice'
// Side-effect import: attaches the response interceptor to the global axios instance.
// Import exactly once — re-importing would stack interceptors.
import '../../Config/axiosConfig'

let mock

beforeAll(() => {
  // axiosConfig sets baseURL from import.meta.env; clear it so test URLs are literal.
  axios.defaults.baseURL = ''
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

beforeEach(() => {
  mock = new MockAdapter(axios)
  vi.clearAllMocks()
})

afterEach(() => {
  mock.restore()
})

describe('401 refresh-queue interceptor', () => {
  it('retries the original request after a successful token refresh', async () => {
    mock.onGet('/tasks').replyOnce(401)
    mock.onPost('/refreshToken').replyOnce(200)
    mock.onGet('/tasks').replyOnce(200, { items: [] })

    const response = await axios.get('/tasks')

    expect(response.data).toEqual({ items: [] })
    expect(mock.history.post).toHaveLength(1)
    expect(mock.history.post[0].url).toBe('/refreshToken')
  })

  it('dispatches logoutUser and rejects when the refresh call fails', async () => {
    mock.onGet('/tasks').replyOnce(401)
    mock.onPost('/refreshToken').replyOnce(401)

    await expect(axios.get('/tasks')).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(logoutUser).toHaveBeenCalledTimes(1)
  })

  it('does not re-enter the refresh flow on a 401 from /refreshToken itself', async () => {
    mock.onPost('/refreshToken').replyOnce(401)

    await expect(axios.post('/refreshToken')).rejects.toMatchObject({
      response: { status: 401 },
    })
    // Only the original call — no recursive refresh attempt
    expect(mock.history.post).toHaveLength(1)
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('issues only one refresh when concurrent requests both receive 401', async () => {
    mock.onGet('/tasks').replyOnce(401)
    mock.onGet('/profile').replyOnce(401)
    mock.onPost('/refreshToken').replyOnce(200)
    mock.onGet('/tasks').replyOnce(200, { data: 'tasks' })
    mock.onGet('/profile').replyOnce(200, { data: 'profile' })

    const [r1, r2] = await Promise.all([
      axios.get('/tasks'),
      axios.get('/profile'),
    ])

    const refreshCalls = mock.history.post.filter(r => r.url === '/refreshToken')
    expect(refreshCalls).toHaveLength(1)
    expect(r1.data).toEqual({ data: 'tasks' })
    expect(r2.data).toEqual({ data: 'profile' })
  })

  it('passes non-401 errors through without attempting a refresh', async () => {
    mock.onGet('/tasks').replyOnce(500)

    await expect(axios.get('/tasks')).rejects.toMatchObject({
      response: { status: 500 },
    })
    expect(mock.history.post).toHaveLength(0)
    expect(store.dispatch).not.toHaveBeenCalled()
  })
})
