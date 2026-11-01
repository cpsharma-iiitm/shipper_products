import { useMutation } from '@tanstack/react-query'
import { trackShipment } from '@/features/tracking/services/trackingService'

/** Looks a shipment up on demand: call `mutate(payload)`, read `data` / `error` / `isPending`. */
export function useTrackShipment() {
  return useMutation({ mutationFn: trackShipment })
}
