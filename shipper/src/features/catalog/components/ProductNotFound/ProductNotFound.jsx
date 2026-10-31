import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import EmptyState from '@/components/molecules/EmptyState'

/** Unknown or no-longer-sold product (the API answers 404 for both). */
export default function ProductNotFound() {
  return (
    <div className="sh-container py-5">
      <EmptyState
        icon="search"
        title="We couldn’t find that product"
        description="It may have been renamed or is no longer available. Browse the rest of our everyday essentials."
        action={
          <Button as={Link} to={paths.shop}>
            Continue shopping
          </Button>
        }
      />
    </div>
  )
}
