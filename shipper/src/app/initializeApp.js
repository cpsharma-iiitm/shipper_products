import { env } from '@/app/config/env'
import { configureHttp, http, queryClient } from '@/app/services'
import { selectAccessToken, signedOut, store } from '@/app/store'
/** One-time wiring that must finish before the first render. */
export async function initializeApp() {
    configureHttp({
        getAuthToken: () => selectAccessToken(store.getState()),
        onUnauthorized: () => {
            store.dispatch(signedOut())
            queryClient.clear()
        },
    })
    if (env.useMockApi) {
        // Loaded lazily so development fixtures are a separate chunk that real builds never fetch.
        const { installMockApi } = await import('@/mocks')
        installMockApi(http)
    }
}