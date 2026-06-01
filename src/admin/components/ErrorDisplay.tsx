import React from "react"

interface ErrorDisplayProps {
  message?: string
  onRetry?: () => void
}

const ErrorDisplay = ({
  message = "Failed to load data.",
  onRetry,
}: ErrorDisplayProps) => (
  <div style={styles.container} role="alert" aria-live="assertive">
    <p style={styles.message}>{message}</p>
    {onRetry && (
      <button style={styles.button} onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
)

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    border: "1px solid #fecaca",
  },
  message: {
    margin: "0 0 16px",
    fontSize: 14,
    color: "#991b1b",
    textAlign: "center",
  },
  button: {
    padding: "8px 24px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 14,
    cursor: "pointer",
  },
}

export default ErrorDisplay
