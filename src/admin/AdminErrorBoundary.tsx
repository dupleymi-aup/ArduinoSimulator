import React from "react"

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      const isProd = process.env.NODE_ENV === "production"
      return (
        <div
          style={{ padding: "2rem", textAlign: "center", fontFamily: "monospace" }}
        >
          <h2>Something went wrong in the admin dashboard</h2>
          {!isProd && (
            <pre
              style={{
                background: "#f5f5f5",
                padding: "1rem",
                borderRadius: "4px",
                overflow: "auto",
                textAlign: "left",
              }}
            >
              {this.state.error?.message}
            </pre>
          )}
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/admin"
              }}
              style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
            >
              Return to dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AdminErrorBoundary
