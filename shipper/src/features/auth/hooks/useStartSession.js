import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { signedIn } from '@/app/store'

/**
 * Returns `startSession(session)`: signs the customer in and sends them back to the page the route guard
 * remembered in `location.state.from` (cart, checkout, account…), or to the home page.
 *
 * The login and signup routes redirect signed-in users on their own, to `from.pathname` or the profile,
 * which would drop the query string (for example an applied coupon). Flushing the sign-in first lets that
 * redirect run before ours, so the navigation below is the one that sticks.
 */
export function useStartSession() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  return useCallback(
    (session) => {
      flushSync(() => dispatch(signedIn(session)))
      navigate(from ? { pathname: from.pathname, search: from.search, hash: from.hash } : paths.home, { replace: true })
    },
    [dispatch, navigate, from],
  )
}
