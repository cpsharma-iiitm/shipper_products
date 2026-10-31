import { Provider as ReduxProvider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { queryClient } from '@/app/services'
import { store } from '@/app/store'
/** Redux, TanStack Query and toast notifications. The router is composed inside App. */
export default function AppProviders({ children }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer position="top-right" autoClose={4000} limit={3} newestOnTop closeOnClick pauseOnHover />
      </QueryClientProvider>
    </ReduxProvider>
  )
}