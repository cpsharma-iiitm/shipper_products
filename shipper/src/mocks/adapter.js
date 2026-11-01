import axios, { AxiosError } from 'axios'

// DEVELOPMENT FIXTURES — NOT AN INTEGRATION.
// A custom Axios adapter that answers requests from in-memory handlers so screens can be built and
// demonstrated before the backend exists. Nothing here is production-ready, and every URL, request
// and response shape is an ASSUMPTION — confirm with backend team.

const MOCK_ORIGIN = 'http://mock.local'
const DEFAULT_LATENCY = { min: 180, max: 420 }

const STATUS_TEXT = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
}

/** Throw from a resolver to answer with an error status: throw new MockHttpError(404, 'Not found'). */
export class MockHttpError extends Error {
  constructor(status, message, data = { message }) {
    super(message)
    this.name = 'MockHttpError'
    this.status = status
    this.data = data
  }
}

function compilePath(path) {
  const keys = []
  const pattern = path
    .replace(/\/+$/, '')
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1))
        return '([^/]+)'
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { keys, regex: new RegExp(`^${pattern}/?$`) }
}

/**
 * defineHandler('get', '/products/:code', ({ params, query, body }) => ({ data: {...} }))
 * The resolver returns { status = 200, data, headers } or throws MockHttpError.
 */
export function defineHandler(method, path, resolver) {
  return { method: method.toLowerCase(), path, resolver, ...compilePath(path) }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function parseBody(data) {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

function buildResponse(config, status, data, headers = {}) {
  return { data, status, statusText: STATUS_TEXT[status] ?? '', headers, config, request: {} }
}

export function createMockAdapter(handlers, { latency = DEFAULT_LATENCY } = {}) {
  return async function mockAdapter(config) {
    const method = (config.method ?? 'get').toLowerCase()
    const url = new URL(axios.getUri(config), MOCK_ORIGIN)
    const basePath = new URL(config.baseURL ?? '', MOCK_ORIGIN).pathname.replace(/\/$/, '')
    const path = url.pathname.startsWith(basePath) ? url.pathname.slice(basePath.length) || '/' : url.pathname

    await wait(latency.min + Math.random() * (latency.max - latency.min))
    if (config.signal?.aborted) throw new axios.CanceledError(undefined, config)

    let status = 404
    let data = { message: `No mock handler for ${method.toUpperCase()} ${path}` }
    let headers = {}

    const handler = handlers.find((candidate) => candidate.method === method && candidate.regex.test(path))
    if (handler) {
      const values = path.match(handler.regex).slice(1)
      const params = Object.fromEntries(handler.keys.map((key, index) => [key, decodeURIComponent(values[index])]))
      try {
        const result = await handler.resolver({
          params,
          query: Object.fromEntries(url.searchParams),
          body: parseBody(config.data),
          headers: config.headers,
          config,
        })
        status = result?.status ?? 200
        data = result?.data
        headers = result?.headers ?? {}
      } catch (error) {
        if (!(error instanceof MockHttpError)) throw error
        status = error.status
        data = error.data
      }
    } else {
      console.warn(`[mock-api] ${data.message}`)
    }

    const response = buildResponse(config, status, data, headers)
    if (!config.validateStatus || config.validateStatus(status)) return response
    throw new AxiosError(
      `Request failed with status code ${status}`,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      response,
    )
  }
}
