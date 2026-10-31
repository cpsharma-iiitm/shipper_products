import { RouterProvider } from 'react-router-dom'
import { MockModeBanner } from '@/components/molecules'
import { router } from '@/app/router'
export default function App() {
  return (
    <>
      <MockModeBanner />
      <RouterProvider router={router} />
    </>
  )
}