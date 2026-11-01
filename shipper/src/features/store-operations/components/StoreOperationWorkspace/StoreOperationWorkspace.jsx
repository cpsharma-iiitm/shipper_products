import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/molecules/PageHeader'
import { TabPanel } from '@/components/molecules/Tabs'
import { paths } from '@/app/router/paths'
import { pluralize } from '@/lib/format'
import { HeaderActionsProvider } from '@/features/store-operations/components/HeaderActions'
import StageTabs from '@/features/store-operations/components/StageTabs'
import { useStageCounts } from '@/features/store-operations/hooks/useStoreOperations'
import { STAGE_VIEWS } from './stageViews'
import styles from './StoreOperationWorkspace.module.scss'

const TABS_ID = 'store-operation'

function describe(stage, counts) {
  if (stage.stage !== 'delayed' || !counts) return stage.description
  return `${stage.description} ${pluralize(counts.delayed, 'order')} need${counts.delayed === 1 ? 's' : ''} attention · ${counts.delayedBeyondSla} beyond SLA.`
}

/** Header, stage tabs and the view of the selected stage. The tabs stay mounted while the stage changes. */
export default function StoreOperationWorkspace({ stage }) {
  const navigate = useNavigate()
  const counts = useStageCounts()
  const [actionsSlot, setActionsSlot] = useState(null)
  const StageView = STAGE_VIEWS[stage.key]

  return (
    <div className={styles.workspace}>
      <PageHeader
        className={styles.header}
        title={stage.title}
        description={describe(stage, counts.data)}
        actions={<div ref={setActionsSlot} className={styles.actions} />}
      />
      <StageTabs id={TABS_ID} value={stage.key} counts={counts.data} onChange={(key) => navigate(paths.admin.storeTab(key))} />
      <TabPanel id={TABS_ID} tabKey={stage.key} value={stage.key} className={styles.stage}>
        <HeaderActionsProvider value={actionsSlot}>
          <StageView />
        </HeaderActionsProvider>
      </TabPanel>
    </div>
  )
}
