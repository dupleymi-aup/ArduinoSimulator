import React from "react"
import { trackEvent, TrackEventType } from "../utils/tracking"
import { useTracking } from "../contexts/TrackingContext"

/**
 * Hook that returns a trackEvent wrapper bound to the current tracking context.
 * Usage: const track = useEventTracking(); track("sim_start", { ... })
 */
export function useEventTracking() {
  const { backendAvailable } = useTracking()

  const track = React.useCallback(
    (type: TrackEventType, payload: object = {}) => {
      if (backendAvailable) {
        trackEvent(type, payload)
      }
    },
    [backendAvailable]
  )

  return track
}
