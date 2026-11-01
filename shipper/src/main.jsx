import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/styles/main.scss'
import App from '@/app/App'
import { initializeApp } from '@/app/initializeApp'
import { AppProviders } from '@/app/providers'

initializeApp().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  )
})
