import styles from './StageGrid.module.scss'

/**
 * The two-column work area of a stage: the queue (or the order being worked) on the left and the side
 * panels on the right. `panelWidth` is the width the design gives the right column on desktop; below
 * 1280px the panels stack under the main column.
 */
export default function StageGrid({ panelWidth, main, aside }) {
  return (
    <div className={styles.grid} style={{ '--panel-width': panelWidth }}>
      <div className={styles.column}>{main}</div>
      <div className={styles.column}>{aside}</div>
    </div>
  )
}
