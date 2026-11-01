import { useParams } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import PageHeader from '@/components/molecules/PageHeader'
import { getPolicy, PolicyAside, PolicyDocument } from '@/features/policies'
import NotFoundPage from '@/pages/NotFoundPage'

export default function PolicyPage() {
  const { slug } = useParams()
  const policy = getPolicy(slug)

  if (!policy) return <NotFoundPage />

  return (
    <div className="sh-container py-4 py-lg-5">
      <Breadcrumbs items={[{ label: 'Home', to: paths.home }, { label: policy.title }]} className="mb-4" />
      <PageHeader variant="storefront" title={policy.title} description={policy.summary} className="mb-4 mb-lg-5" />
      <div className="row g-4 g-lg-5">
        <div className="col-12 col-lg-8">
          <PolicyDocument policy={policy} />
        </div>
        <div className="col-12 col-lg-4">
          <PolicyAside />
        </div>
      </div>
    </div>
  )
}
