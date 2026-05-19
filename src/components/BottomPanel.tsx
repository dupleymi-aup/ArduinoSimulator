import React from "react"
import ErrorConsole from "./ErrorConsole"
import ApiReference from "./ApiReference"
import { useSimulatorContext } from "../contexts/SimulatorContext"
import { t } from "../utils/languages"

interface BottomPanelProps {
  children: React.ReactNode
}

const BottomPanel = ({ children }: BottomPanelProps) => {
  const { runtimeError, setRuntimeError } = useSimulatorContext()
  const [showApi, setShowApi] = React.useState<boolean>(false)

  const handleClearError = () => {
    setRuntimeError(null)
  }

  const toggleApi = () => setShowApi(!showApi)

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <button
          style={{
            ...styles.toolButton,
            backgroundColor: showApi ? "#00979D" : "#F2F2F2",
            color: showApi ? "#FFFFFF" : "#333333",
          }}
          onClick={toggleApi}
        >
          {t("API_REFERENCE")}
        </button>
      </div>
      {showApi && <ApiReference onClose={() => setShowApi(false)} />}
      <ErrorConsole error={runtimeError} onClear={handleClearError} />
      <div style={styles.content}>{children}</div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: "24px",
    height: "251px",
    borderTop: "1px solid #D3D3D3",
    backgroundColor: "#F2F2F2",
    borderLeft: "1px solid #D3D3D3",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  toolbar: {
    display: "flex",
    gap: "4px",
    padding: "2px 8px",
    borderBottom: "1px solid #D3D3D3",
    backgroundColor: "#E8E8E8",
  },
  toolButton: {
    padding: "2px 8px",
    border: "1px solid #D3D3D3",
    borderRadius: "2px",
    cursor: "pointer",
    fontFamily: "Arial",
    fontSize: "11px",
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
}

export default BottomPanel
