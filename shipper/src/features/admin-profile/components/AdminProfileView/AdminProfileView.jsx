import { getErrorMessage } from '@/app/services'
import { paths } from '@/app/router/paths'
import Skeleton from '@/components/atoms/Skeleton'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import { useLogout } from '@/features/auth'
import { useAdminProfile } from '@/features/admin-profile/hooks/useAdminProfile'
import ChangePasswordForm from '@/features/admin-profile/components/ChangePasswordForm'
import ProfileDetailsForm from '@/features/admin-profile/components/ProfileDetailsForm'
import ProfileSummaryCard from '@/features/admin-profile/components/ProfileSummaryCard'
import styles from './AdminProfileView.module.scss'
 
/** The signed-in admin's own profile: summary and sign out, edit details and change password. */
export default function AdminProfileView() {
  const { data: profile, isPending, isError, error, refetch } = useAdminProfile()
  const logout = useLogout({ redirectTo: paths.admin.login })
 
  return (
    <div className={styles.page}>
      <PageHeader title="My profile" description="Your account details, password and sign-in activity." />
      {isError && <ErrorState title="Your profile could not be loaded" message={getErrorMessage(error)} onRetry={refetch} />}
      {isPending && (
        <div className={styles.layout} aria-hidden="true">
          <Skeleton height="26rem" radius="8px" />
          <div className={styles.forms}>
            <Skeleton height="14rem" radius="8px" />
            <Skeleton height="14rem" radius="8px" />
          </div>
        </div>
      )}
      {profile && (
        <div className={styles.layout}>
          <ProfileSummaryCard profile={profile} signingOut={logout.isPending} onSignOut={() => logout.mutate()} />
          <div className={styles.forms}>
            <ProfileDetailsForm key={`${profile.name}|${profile.email}|${profile.mobile}`} profile={profile} />
            <ChangePasswordForm />
          </div>
        </div>
      )}
    </div>
  )
}