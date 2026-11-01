import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { selectIsAuthenticated } from '@/app/store'
import { useSavedProductToggle } from '@/features/saved'

/**
 * Heart toggle for catalogue screens: signed-in customers save or unsave, signed-out visitors are
 * sent to the login page and brought back afterwards.
 */
export function useSaveProduct() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  const { isSaved, toggle } = useSavedProductToggle()

  const onToggleSaved = (productCode) => {
    if (!isAuthenticated) {
      navigate(paths.login, { state: { from: location } })
      return
    }
    toggle(productCode)
  }

  return { isSaved, onToggleSaved }
}
