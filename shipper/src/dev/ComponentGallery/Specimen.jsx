import styles from './ComponentGallery.module.scss'

export function Section({ id, title, description, children }) {
    return (
        <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
            <h2 id={`${id}-title`} className={styles.sectionTitle}>
                {title}
            </h2>
            {description && <p className={styles.sectionDescription}>{description}</p>}
            <div className={styles.sectionBody}>{children}</div>
        </section>
    )
}

export function Specimen({ label, children, wide = false }) {
    return (
        <div className={wide ? styles.specimenWide : styles.specimen}>
            <p className={styles.specimenLabel}>{label}</p>
            {children}
        </div>
    )
}