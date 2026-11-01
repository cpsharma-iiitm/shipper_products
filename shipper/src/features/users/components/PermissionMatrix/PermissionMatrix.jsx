import { Fragment } from 'react'
import Checkbox from '@/components/atoms/Checkbox'
import { groupModules, groupState, toggleGroup, toggleModule, atLeast } from '@/features/users/lib/permissions'
import styles from './PermissionMatrix.module.scss'

const ACCESS = [
  { key: 'read', label: 'Read' },
  { key: 'write', label: 'Write' },
]

/**
 * Read / Write checkboxes per module, grouped by area, with a toggle per group.
 * Display and editing UI only: it edits a draft of the role's permissions; authorization is backend work.
 *   modules: [{ key, group, label, description }]   permissions: { [moduleKey]: 'none' | 'read' | 'write' }
 *   onChange(nextPermissions)   readOnly: shows the matrix without letting it be edited (built-in role)
 */
export default function PermissionMatrix({ modules, permissions, onChange, readOnly = false }) {
  const groups = groupModules(modules)

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <caption className="visually-hidden">Module permissions</caption>
          <thead>
            <tr>
              <th scope="col">Module</th>
              {ACCESS.map((access) => (
                <th key={access.key} scope="col" className={styles.check}>
                  {access.label}
                </th>
              ))}
            </tr>
          </thead>
          {groups.map(({ group, modules: groupItems }) => (
            <Fragment key={group}>
              <tbody>
                <tr className={styles.groupRow}>
                  <th scope="colgroup" className={styles.groupName}>
                    {group}
                  </th>
                  {ACCESS.map((access) => {
                    const state = groupState(permissions, groupItems, access.key)
                    return (
                      <td key={access.key} className={styles.check}>
                        <Checkbox
                          aria-label={`${access.label} all ${group} modules`}
                          checked={state === 'all'}
                          indeterminate={state === 'some'}
                          disabled={readOnly}
                          onChange={() => onChange(toggleGroup(permissions, groupItems, access.key, state !== 'all'))}
                        />
                      </td>
                    )
                  })}
                </tr>
                {groupItems.map((module) => (
                  <tr key={module.key}>
                    <th scope="row" className={styles.moduleCell}>
                      <span className={styles.moduleText}>
                        <span className={styles.moduleName}>{module.label}</span>
                        <span className={styles.moduleHint}>{module.description}</span>
                      </span>
                    </th>
                    {ACCESS.map((access) => (
                      <td key={access.key} className={styles.check}>
                        <Checkbox
                          aria-label={`${access.label} ${module.label}`}
                          checked={atLeast(permissions[module.key], access.key)}
                          disabled={readOnly}
                          onChange={(event) => onChange(toggleModule(permissions, module.key, access.key, event.target.checked))}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Fragment>
          ))}
        </table>
      </div>
    </div>
  )
}
