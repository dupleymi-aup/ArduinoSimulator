import React from "react"

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error is stored in state and displayed to the user.
    // Detailed logging is intentionally suppressed in production builds.
    void _error
    void _errorInfo
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      const isProduction = process.env.NODE_ENV === "production"

      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              The application encountered an unexpected error.
              {isProduction && (
                <span> Please try refreshing the page or contact support.</span>
              )}
            </p>
            {!isProduction && this.state.error && (
              <pre style={styles.error}>{this.state.error.message}</pre>
            )}
            <button style={styles.button} onClick={this.handleReset}>
              Return to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  content: {
    maxWidth: "500px",
    textAlign: "center",
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: "12px",
  },
  message: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
  },
  error: {
    fontSize: "12px",
    color: "#991b1b",
    backgroundColor: "#fef2f2",
    padding: "12px",
    borderRadius: "4px",
    textAlign: "left",
    overflow: "auto",
    maxHeight: "200px",
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  },
}

export default ErrorBoundary
