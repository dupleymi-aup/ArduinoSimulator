import React from "react"
import { useAuth } from "./hooks/useAuth"

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const { login } = useAuth()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const ok = await login(username, password)
    if (ok) {
      onLogin()
    } else {
      setError("Invalid username or password")
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Arduino Simulator Admin</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: "32px 40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: 360,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: 22,
    color: "#333",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    marginBottom: 4,
    fontSize: 14,
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 4,
    boxSizing: "border-box",
  },
  error: {
    color: "#e74c3c",
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    width: "100%",
    padding: "10px 0",
    backgroundColor: "#0066cc",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 15,
    cursor: "pointer",
  },
}

export default AdminLogin
