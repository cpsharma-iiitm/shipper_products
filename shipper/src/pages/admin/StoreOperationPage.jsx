import { Navigate, useParams } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { DEFAULT_STAGE_KEY, findStage, StoreOperationWorkspace } from '@/features/store-operations'

/** /admin/store-operation/:tab: the warehouse fulfilment workspace. An unknown tab goes to New Orders. */
export default function StoreOperationPage() {
  const { tab } = useParams()
  const stage = findStage(tab)
  if (!stage) return <Navigate to={paths.admin.storeTab(DEFAULT_STAGE_KEY)} replace />
  return <StoreOperationWorkspace stage={stage} />
}
