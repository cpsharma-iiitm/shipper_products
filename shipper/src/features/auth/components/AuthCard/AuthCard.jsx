
import { useId } from 'react'

import Badge from '@/components/atoms/Badge'

import Card from '@/components/atoms/Card'

import styles from './AuthCard.module.scss'
 
/** Panel shared by the login and signup forms: heading, one-line intro, and a small label chip. */

export default function AuthCard({ title, description, chip, children }) {

  const titleId = useId()

  return (
<Card as="section" aria-labelledby={titleId} padding="md" className={styles.card}>
<h2 id={titleId} className={styles.title}>

        {title}
</h2>
<p className={styles.description}>{description}</p>
<Badge tone="info" className={styles.chip}>

        {chip}
</Badge>

      {children}
</Card>

  )

}