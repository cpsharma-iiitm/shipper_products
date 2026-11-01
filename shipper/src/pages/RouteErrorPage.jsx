import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import ErrorState from '@/components/molecules/ErrorState'

/** Root error boundary for the router: a route failed to load or a page threw while rendering. */
export default function RouteErrorPage() {
  const error = useRouteError()
  const isNotFound = isRouteErrorResponse(error) && error.status === 404

  if (import.meta.env.DEV) console.error(error)

  return (
    <div className="sh-container py-5">
      <ErrorState
        title={isNotFound ? 'We can’t find that page' : 'Something went wrong'}
        message={
          isNotFound
            ? 'The link may be broken or the page may have moved.'
            : 'The page could not be displayed. Reload to try again, or head back to the home page.'
        }
        onRetry={isNotFound ? undefined : () => window.location.reload()}
      />
      <div className="d-flex justify-content-center">
        <Button as={Link} to={paths.home} variant="secondary">
          Back to home
        </Button>
      </div>
    </div>
  )
}
