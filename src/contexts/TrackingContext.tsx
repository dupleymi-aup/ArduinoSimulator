import React from "react"
import { generateStudentId } from "../utils/fingerprint"
import {
  checkBackendHealth,
  startSession,
  endSession,
  sendHeartbeat,
  isBackendAvailable,
} from "../utils/tracking"

interface TrackingContextType {
  studentId: string | null
  sessionId: string | null
  backendAvailable: boolean
}

const TrackingContext = React.createContext<TrackingContextType>({
  studentId: null,
  sessionId: null,
  backendAvailable: false,
})

export function TrackingProvider({ children }) {
  const [studentId, setStudentId] = React.useState<string | null>(null)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [backendAvailable, setBackendAvailable] = React.useState<boolean>(false)
  const sessionStartRef = React.useRef<number>(Date.now())

  // Initialize: check backend, generate student ID, start session
  React.useEffect(() => {
    ;(async () => {
      const healthy = await checkBackendHealth()
      setBackendAvailable(healthy)

      if (!healthy) return

      const id = generateStudentId()
      setStudentId(id)

      const sessId = await startSession(id)
      if (sessId) {
        setSessionId(sessId)
        sessionStartRef.current = Date.now()
      }
    })()
  }, [])

  // Heartbeat every 60s
  React.useEffect(() => {
    if (!backendAvailable || !sessionId) return

    const interval = setInterval(() => {
      sendHeartbeat()
    }, 60000)

    return () => clearInterval(interval)
  }, [backendAvailable, sessionId])

  // Session cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (backendAvailable && sessionId) {
        const duration = Date.now() - sessionStartRef.current
        endSession(duration, "page_unload")
      }
    }
  }, [backendAvailable, sessionId])

  return (
    <TrackingContext.Provider
      value={{ studentId, sessionId, backendAvailable }}
    >
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  return React.useContext(TrackingContext)
}
