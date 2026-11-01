// The six Store Operation stages in tab order. `key` is the URL segment (paths.admin.storeTab), `stage`
// the name the API uses, `countKey` the field of the counts response that feeds the tab badge.
export const STAGES = [
  {
    key: 'new-orders',
    stage: 'new',
    countKey: 'new',
    label: 'New Orders',
    title: 'Store Operation',
    description: 'Verify payment and stock before releasing orders to the warehouse.',
  },
  {
    key: 'to-pick',
    stage: 'to_pick',
    countKey: 'to_pick',
    label: 'To Pick',
    title: 'Store Operation',
    description: 'Pick accurately. Verify stock and scan every item before packing.',
  },
  {
    key: 'to-pack',
    stage: 'to_pack',
    countKey: 'to_pack',
    label: 'To Pack',
    title: 'Store Operation',
    description: 'Check the contents, prepare documents, and seal the parcel.',
  },
  {
    key: 'ready-to-dispatch',
    stage: 'ready',
    countKey: 'ready',
    label: 'Ready to Dispatch',
    title: 'Store Operation',
    description: 'Assign tracking, print labels, and hand packed orders to India Post.',
  },
  {
    key: 'dispatched',
    stage: 'dispatched',
    countKey: 'dispatched',
    label: 'Dispatched',
    title: 'Store Operation',
    description: 'Monitor shipments and delivery outcomes with India Post.',
  },
  {
    key: 'delayed',
    stage: 'delayed',
    countKey: 'delayed',
    label: 'Delayed Orders',
    title: 'Delayed Orders',
    description: 'Resolve exceptions early.',
  },
]

export const DEFAULT_STAGE_KEY = STAGES[0].key

export const findStage = (key) => STAGES.find((stage) => stage.key === key) ?? null
