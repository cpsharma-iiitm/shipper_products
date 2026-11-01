import heroImage from '@/features/auth/assets/auth-hero.jpg'
import styles from './AuthHero.module.scss'
/** Welcome banner above the login and signup forms. The picture is the artboard's still life, a design asset. */
export default function AuthHero() {
  return (
    <section className={styles.hero} aria-labelledby="auth-hero-title">
      <div className={styles.text}>
        <p className={styles.eyebrow}>Your everyday, made easier</p>
        <h1 id="auth-hero-title" className={styles.title}>
          Good to have you here.
        </h1>
        <p className={styles.lead}>One account for thoughtful finds, easy orders, and wallet rewards.</p>
      </div>
      <div className={styles.media}>
        <img src={heroImage} alt="" className={styles.image} width="1376" height="768" />
      </div>
    </section>
  )
}
