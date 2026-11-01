import { useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '@/app/services'
import Skeleton from '@/components/atoms/Skeleton'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import PurchaseForm from '@/features/purchases/components/PurchaseForm'
import { usePurchase, usePurchaseDraft } from '@/features/purchases/hooks/usePurchases'
import styles from './CreatePurchaseWorkspace.module.scss'

/** Create purchase page content. `?draft=PUR-…` continues a saved draft; otherwise it starts a new one. */
export default function CreatePurchaseWorkspace() {
  const [searchParams] = useSearchParams()
  const resumeNumber = searchParams.get('draft')
  const context = usePurchaseDraft()
  const saved = usePurchase(resumeNumber)

  const failed = context.isError || (resumeNumber && saved.isError)
  const ready = context.data && (!resumeNumber || saved.data)
  const draftNumber = resumeNumber ?? context.data?.purchaseNumber

  return (
    <div className={styles.page}>
      <PageHeader
        title="Create purchase"
        description={draftNumber ? `Draft #${draftNumber} · Add a customer, verify items, and confirm the gross amount.` : 'Add a customer, verify items, and confirm the gross amount.'}
      />
      {failed && (
        <ErrorState
          title="This purchase could not be opened"
          message={getErrorMessage(context.error ?? saved.error)}
          onRetry={() => (context.isError ? context.refetch() : saved.refetch())}
        />
      )}
      {!failed && !ready && (
        <div className={styles.loading} aria-hidden="true">
          <Skeleton height="11rem" radius="8px" />
          <Skeleton height="22rem" radius="8px" />
        </div>
      )}
      {!failed && ready && (
        <PurchaseForm key={draftNumber} draftNumber={draftNumber} paymentMethods={context.data.paymentMethods} purchase={saved.data ?? null} />
      )}
    </div>
  )
}
