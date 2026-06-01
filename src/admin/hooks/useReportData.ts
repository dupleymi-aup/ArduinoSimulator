import React from "react"

/**
 * Generic hook that handles loading, error, and data state for admin reports.
 * Eliminates ~15 lines of duplicated boilerplate per report component.
 * Uses AbortController to cancel in-flight requests on unmount or dependency change.
 *
 * @param fetchFn - Async function that accepts an AbortSignal and returns the report data
 * @param dependencies - Dependencies that trigger a reload (e.g., date range)
 */
export function useReportData<T>(
  fetchFn: (_signal: AbortSignal) => Promise<unknown>,
  dependencies: React.DependencyList = []
): {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
} {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const reload = React.useCallback(() => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)
    fetchFn(controller.signal)
      .then((d) => {
        if (!controller.signal.aborted) {
          setData(d as T)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Failed to load data")
          setLoading(false)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, ...dependencies])

  React.useEffect(() => {
    reload()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [reload])

  return { data, loading, error, reload }
}
