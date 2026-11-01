import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/app/store'
import TrackingHelp from '@/features/tracking/components/TrackingHelp'
import TrackingResult from '@/features/tracking/components/TrackingResult'
import TrackShipmentForm from '@/features/tracking/components/TrackShipmentForm'
import { useTrackShipment } from '@/features/tracking/hooks/useTrackShipment'
import styles from './TrackShipment.module.scss'

/** The public Track shipment screen: the lookup form on the left, the result (or where to find the details) beside it. */
export default function TrackShipment() {
  const user = useSelector(selectCurrentUser)
  const track = useTrackShipment()

  return (
    <div className={styles.layout}>
      <TrackShipmentForm onSubmit={track.mutate} isPending={track.isPending} error={track.error} defaultMobile={user?.mobile ?? ''} />
      <div>
        {track.data ? <TrackingResult key={track.submittedAt} tracking={track.data} /> : <TrackingHelp />}
        <p className="visually-hidden" role="status">
          {track.isPending ? 'Looking up your shipment' : ''}
        </p>
      </div>
    </div>
  )
}
