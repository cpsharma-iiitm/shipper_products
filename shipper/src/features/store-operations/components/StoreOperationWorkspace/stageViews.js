import DelayedStage from '@/features/store-operations/components/DelayedStage'
import DispatchedStage from '@/features/store-operations/components/DispatchedStage'
import NewOrdersStage from '@/features/store-operations/components/NewOrdersStage'
import ReadyToDispatchStage from '@/features/store-operations/components/ReadyToDispatchStage'
import ToPackStage from '@/features/store-operations/components/ToPackStage'
import ToPickStage from '@/features/store-operations/components/ToPickStage'

/** Stage key (URL segment) → the component that renders it. */
export const STAGE_VIEWS = {
  'new-orders': NewOrdersStage,
  'to-pick': ToPickStage,
  'to-pack': ToPackStage,
  'ready-to-dispatch': ReadyToDispatchStage,
  dispatched: DispatchedStage,
  delayed: DelayedStage,
}
