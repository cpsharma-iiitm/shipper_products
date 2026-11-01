import { Link, useLocation } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Alert from '@/components/molecules/Alert'
import AuthHero from '@/features/auth/components/AuthHero'
import LoginForm from '@/features/auth/components/LoginForm'
import SignupForm from '@/features/auth/components/SignupForm'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import styles from './AuthScreen.module.scss'

const TWO_PANELS_QUERY = '(min-width: 1024px)'
const SWITCH = {
  login: { text: 'New to Shipper.com?', label: 'Create an account', to: paths.signup },
  signup: { text: 'Already have an account?', label: 'Log in', to: paths.login },
}

/**
 * Login and signup share one screen. Wide screens show both panels side by side, as in the design;
 * narrower ones show only the panel for the current route, with a link to the other.
 */
export default function AuthScreen({ mode }) {
  const twoPanels = useMediaQuery(TWO_PANELS_QUERY)
  const location = useLocation()
  const notice = location.state?.from?.pathname === paths.checkout ? 'Log in or create an account to continue to checkout.' : null
  const other = SWITCH[mode]

  return (
    <div className={styles.screen}>
      <AuthHero />
      {notice && <Alert tone="info">{notice}</Alert>}
      <div className={styles.panels}>
        {(twoPanels || mode === 'login') && <LoginForm />}
        {(twoPanels || mode === 'signup') && <SignupForm />}
      </div>
      {!twoPanels && (
        <p className={styles.switch}>
          {other.text}{' '}
          <Link to={other.to} state={location.state}>
            {other.label}
          </Link>
        </p>
      )}
    </div>
  )
}
