import React from "react"
import { useSimulatorContext } from "../contexts/SimulatorContext"
import { isMega, isNano } from "../utils/service"
import { t } from "../utils/languages"

const StatusBar = () => {
  const { simulatorRunning, boardType } = useSimulatorContext()

  const digitalCount = isMega(boardType || "") ? 54 : 14
  const analogCount = isMega(boardType || "") ? 16 : isNano(boardType || "") ? 8 : 6

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <span
          style={{
            ...styles.dot,
            backgroundColor: simulatorRunning ? "#33CC33" : "#CC3333",
          }}
        />
        <span style={styles.text}>
          {simulatorRunning ? t("STATUS_RUNNING") : t("STATUS_STOPPED")}
        </span>
      </div>
      <div style={styles.section}>
        <span style={styles.text}>{boardType || "UNO R3"}</span>
      </div>
      <div style={styles.section}>
        <span style={styles.text}>
          {t("STATUS_DIGITAL")}: {digitalCount} | {t("STATUS_ANALOG")}: {analogCount}
        </span>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "24px",
    backgroundColor: "#F2F2F2",
    borderTop: "1px solid #D3D3D3",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    fontFamily: "Arial",
    fontSize: "11px",
    color: "#333333",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  section: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
  text: {
    whiteSpace: "nowrap",
  },
}

export default StatusBar
