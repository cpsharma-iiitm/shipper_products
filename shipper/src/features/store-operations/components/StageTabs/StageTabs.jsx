import Tabs from '@/components/molecules/Tabs'
import { STAGES } from '@/features/store-operations/config/stages'
import styles from './StageTabs.module.scss'

/**
 * The six stage tabs with live counts. They are real in-page tabs (tablist, arrow keys) whose selection
 * is the URL, so a stage can be bookmarked and the browser's back button works.
 */
export default function StageTabs({ id, value, counts, onChange }) {
  const items = STAGES.map((stage) => ({ key: stage.key, label: stage.label, count: counts?.[stage.countKey] }))

  return (
    <div className={styles.root}>
      <Tabs id={id} variant="pill" label="Store operation stages" items={items} value={value} onChange={onChange} />
    </div>
  )
}
