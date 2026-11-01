import { paths } from '@/app/router/paths'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import PageHeader from '@/components/molecules/PageHeader'
import { TrackShipment } from '@/features/tracking'

export default function TrackPage() {
  return (
    <div className="sh-container py-4 py-lg-5">
      <Breadcrumbs items={[{ label: 'Home', to: paths.home }, { label: 'Track shipment' }]} className="mb-4" />
      <PageHeader
        variant="storefront"
        title="Track your shipment"
        description="See where your parcel is. No sign-in needed."
        className="mb-4 mb-lg-5"
      />
      <TrackShipment />
    </div>
  )
}
