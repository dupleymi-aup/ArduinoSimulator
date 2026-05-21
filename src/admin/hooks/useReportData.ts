import React from "react"

/**
 * Generic hook that handles loading, error, and data state for admin reports.
 * Eliminates ~15 lines of duplicated boilerplate per report component.
 *
 * @param fetchFn - Async function that returns the report data
 * @param dependencies - Dependencies that trigger a reload (e.g., date range)
 */
export function useReportData<T = any>(
  fetchFn: () => Promise<unknown>,
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

  const reload = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetchFn()
      .then((d) => {
        setData(d as T)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load data")
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, ...dependencies])

  React.useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}
