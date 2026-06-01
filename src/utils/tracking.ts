import logger from "./logger"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"

let activeSessionId: string | null = null
let backendAvailable = false
let healthCheckRetry: ReturnType<typeof setTimeout> | null = null

// Batching for high-frequency pin change events
type PinChange = { type: "digital" | "analog"; pin: number; value: number | boolean }
let pinChangeBuffer: PinChange[] = []
let pinBatchTimeout: ReturnType<typeof setTimeout> | null = null
const PIN_BATCH_INTERVAL = 5000

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    })
    backendAvailable = res.ok
  } catch {
    backendAvailable = false
  }
  if (!backendAvailable) {
    scheduleHealthRetry()
  }
  return backendAvailable
}

function scheduleHealthRetry(): void {
  if (healthCheckRetry) return
  healthCheckRetry = setTimeout(async () => {
    healthCheckRetry = null
    await checkBackendHealth()
  }, 30000)
}

export function cancelHealthRetry(): void {
  if (healthCheckRetry) {
    clearTimeout(healthCheckRetry)
    healthCheckRetry = null
  }
}

export function isBackendAvailable(): boolean {
  return backendAvailable
}

export function getActiveSessionId(): string | null {
  return activeSessionId
}

export function setActiveSessionId(id: string | null) {
  activeSessionId = id
}

function schedulePinBatch(): void {
  if (pinBatchTimeout) return
  pinBatchTimeout = setTimeout(() => {
    pinBatchTimeout = null
    flushPinBatch()
  }, PIN_BATCH_INTERVAL)
}

function flushPinBatch(): void {
  if (pinBatchTimeout) {
    clearTimeout(pinBatchTimeout)
    pinBatchTimeout = null
  }
  if (pinChangeBuffer.length === 0 || !backendAvailable || !activeSessionId) {
    pinChangeBuffer = []
    return
  }

  const data = JSON.stringify({
    sessionId: activeSessionId,
    type: "pin_changes_batch",
    payload: { changes: pinChangeBuffer },
  })

  const sent = navigator.sendBeacon(`${BACKEND_URL}/api/track/event`, data)
  if (!sent) {
    fetch(`${BACKEND_URL}/api/track/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }).catch((err) => logger.warn("Pin batch fallback fetch failed:", err))
  }
  pinChangeBuffer = []
}

function trackPinChange(
  type: "digital" | "analog",
  pin: number,
  value: number | boolean
): void {
  if (!backendAvailable || !activeSessionId) return

  pinChangeBuffer.push({ type, pin, value })
  if (pinChangeBuffer.length >= 50) {
    flushPinBatch()
  } else {
    schedulePinBatch()
  }
}

export type TrackEventType =
  | "sim_start"
  | "sim_stop"
  | "sim_crash"
  | "digital_pin_change"
  | "analog_pin_change"
  | "serial_output"
  | "runtime_error"
  | "file_new"
  | "file_open"
  | "file_save"
  | "file_example_load"
  | "board_change"
  | "serial_send"
  | "autosave"

export function trackEvent(
  type: TrackEventType,
  payload: Record<string, unknown> = {}
) {
  if (!backendAvailable || !activeSessionId) return

  const data = JSON.stringify({ sessionId: activeSessionId, type, payload })

  const sent = navigator.sendBeacon(`${BACKEND_URL}/api/track/event`, data)
  if (!sent) {
    // sendBeacon queue full or blocked, fallback to fetch
    fetch(`${BACKEND_URL}/api/track/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }).catch((err) => logger.warn("Tracking fallback fetch failed:", err))
  }
}

export async function startSession(
  studentId: string,
  sketchName?: string,
  boardType?: string
): Promise<string | null> {
  if (!backendAvailable) return null

  try {
    const res = await fetch(`${BACKEND_URL}/api/track/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, sketchName, boardType }),
    })

    if (res.ok) {
      const data = await res.json()
      activeSessionId = data.sessionId
      return data.sessionId
    }
    backendAvailable = false
    scheduleHealthRetry()
  } catch {
    backendAvailable = false
    scheduleHealthRetry()
  }
  return null
}

export async function endSession(
  durationMs: number,
  endReason: string
): Promise<boolean> {
  flushPinBatch()
  if (!backendAvailable || !activeSessionId) return false

  const data = JSON.stringify({
    sessionId: activeSessionId,
    durationMs,
    endReason,
  })

  const sent = navigator.sendBeacon(`${BACKEND_URL}/api/track/session/end`, data)
  if (!sent) {
    // sendBeacon failed, fallback to fetch
    try {
      await fetch(`${BACKEND_URL}/api/track/session/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
      })
      return true
    } catch {
      return false
    }
  }
  return true
}

export function sendHeartbeat(): boolean {
  if (!backendAvailable || !activeSessionId) return false

  const sent = navigator.sendBeacon(
    `${BACKEND_URL}/api/track/heartbeat`,
    JSON.stringify({ sessionId: activeSessionId })
  )
  return sent
}

export { trackPinChange }
