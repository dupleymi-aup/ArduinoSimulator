import React from "react"

interface LoadingStateProps {
  message?: string
}

const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <div style={styles.container} role="status" aria-live="polite">
      <div style={styles.spinner} />
      <p style={styles.text}>{message}</p>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    minHeight: 200,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #0066cc",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  text: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
}

export default LoadingState
