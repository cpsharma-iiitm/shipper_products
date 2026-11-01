import { createMockAdapter } from './adapter'
import { handlers } from './handlers'

export { defineHandler, MockHttpError } from './adapter'

export function installMockApi(instance) {
  instance.defaults.adapter = createMockAdapter(handlers)
  console.info('[mock-api] Development fixtures are active. Responses are simulated, not from a backend.')
}
