import React from "react"
import { t } from "../utils/languages"

interface ErrorConsoleProps {
  error: string | null
  onClear: () => void
}

const ErrorConsole = ({ error, onClear }: ErrorConsoleProps) => {
  const outputRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (outputRef.current) {
      outputRef.current.textContent = error
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [error])

  if (!error) return null

  return (
    <div
      style={styles.container}
      role="log"
      aria-live="assertive"
      aria-label={t("ERROR_CONSOLE_TITLE")}
    >
      <div style={styles.header}>
        <span style={styles.title}>{t("ERROR_CONSOLE_TITLE")}</span>
        <button style={styles.clearButton} onClick={onClear}>
          {t("ERROR_CLEAR")}
        </button>
      </div>
      <div ref={outputRef} style={styles.output} />
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "monospace",
    fontSize: "12px",
    backgroundColor: "#2D1F1F",
    borderTop: "2px solid #CC3333",
    padding: "0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 8px",
    backgroundColor: "#CC3333",
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: "12px",
  },
  clearButton: {
    backgroundColor: "#AA2222",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "3px",
    padding: "2px 8px",
    cursor: "pointer",
    fontSize: "11px",
  },
  output: {
    height: "80px",
    overflowY: "auto",
    padding: "8px",
    color: "#FF9999",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
}

export default ErrorConsole
