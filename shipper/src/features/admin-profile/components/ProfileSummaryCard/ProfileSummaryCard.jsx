
import Avatar from '@/components/atoms/Avatar'

import Badge from '@/components/atoms/Badge'

import Button from '@/components/atoms/Button'

import Card from '@/components/atoms/Card'

import Icon from '@/components/atoms/Icon'

import { formatDate, formatDateTime } from '@/lib/date'

import styles from './ProfileSummaryCard.module.scss'

/** Who is signed in: avatar, name, role, contact details, sign-in activity and Sign out. */

export default function ProfileSummaryCard({ profile, onSignOut, signingOut }) {

    return (
        <Card padding="md" radius="md" className={styles.card} aria-label="Account summary">
            <div className={styles.identity}>
                <Avatar name={profile.name} size="lg" className={styles.avatar} />
                <h2 className={styles.name}>{profile.name}</h2>
                <Badge tone="info" icon="shield-check">

                    {profile.roleLabel}
                </Badge>
            </div>

            <dl className={styles.details}>
                <div>
                    <dt>
                        <Icon name="envelope" /> Email
                    </dt>
                    <dd>{profile.email}</dd>
                </div>
                <div>
                    <dt>
                        <Icon name="telephone" /> Mobile
                    </dt>
                    <dd>+91 {profile.mobile}</dd>
                </div>
                <div>
                    <dt>
                        <Icon name="clock-history" /> Last login
                    </dt>
                    <dd>

                        {formatDateTime(profile.lastLoginAt)}

                        {profile.lastLoginPlace && <span className={styles.place}>{profile.lastLoginPlace}</span>}
                    </dd>
                </div>
                <div>
                    <dt>
                        <Icon name="calendar-check" /> Member since
                    </dt>
                    <dd>{formatDate(profile.memberSince)}</dd>
                </div>
            </dl>

            <Button variant="secondary" leftIcon="box-arrow-right" fullWidth loading={signingOut} onClick={onSignOut}>

                Sign out
            </Button>
        </Card>

    )

}