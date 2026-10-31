import Button from '@/components/atoms/Button'
import EmptyState from '@/components/molecules/EmptyState'
/**
* Failed-request panel with an optional retry. Pass a user-safe `message` (getErrorMessage(error)
* from @/app/services); raw error objects and stack traces are never shown.
*/
export default function ErrorState({ title = 'Something went wrong', message, onRetry, compact = false, className }) {
  return (
    <EmptyState
      icon="exclamation-triangle"
      title={title}
      description={message}
      compact={compact}
      className={className}
      action={
        onRetry && (
          <Button variant="secondary" leftIcon="arrow-clockwise" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  )
}