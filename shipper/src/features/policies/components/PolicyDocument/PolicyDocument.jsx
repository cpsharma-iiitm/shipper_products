import styles from './PolicyDocument.module.scss'

/** A policy as readable text: numbered sections of paragraphs and bullet points. */
export default function PolicyDocument({ policy }) {
  return (
    <article className={styles.document}>
      {policy.sections.map((section, index) => (
        <section key={section.heading} className={styles.section} aria-labelledby={`policy-section-${index}`}>
          <h2 id={`policy-section-${index}`} className={styles.heading}>
            {section.heading}
          </h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          {section.points && (
            <ul className={styles.points}>
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  )
}
