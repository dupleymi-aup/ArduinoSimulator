import React from "react"
import { t } from "../utils/languages"

interface WelcomeModalProps {
  onDismiss: (_: boolean) => void
}

const WelcomeModal = ({ onDismiss }: WelcomeModalProps) => {
  const [dontShowAgain, setDontShowAgain] = React.useState<boolean>(false)

  const handleDismiss = () => {
    onDismiss(dontShowAgain)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span>{t("WELCOME_TITLE")}</span>
        </div>
        <div style={styles.body}>
          <p>{t("WELCOME_MESSAGE")}</p>
          <ul style={styles.featureList}>
            <li>{t("WELCOME_FEATURE_EDITOR")}</li>
            <li>{t("WELCOME_FEATURE_PINS")}</li>
            <li>{t("WELCOME_FEATURE_SERIAL")}</li>
            <li>{t("WELCOME_FEATURE_EEPROM")}</li>
            <li>{t("WELCOME_FEATURE_BOARDS")}</li>
          </ul>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            &nbsp;{t("WELCOME_DONT_SHOW")}
          </label>
        </div>
        <div style={styles.footer}>
          <button style={styles.button} onClick={handleDismiss}>
            {t("WELCOME_GET_STARTED")}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    width: "450px",
    maxWidth: "90vw",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#00979D",
    color: "#FFFFFF",
    padding: "12px 16px",
    fontWeight: "bold",
    fontSize: "16px",
  },
  body: {
    padding: "16px",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#333333",
  },
  featureList: {
    margin: "12px 0",
    paddingLeft: "20px",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    marginTop: "12px",
    fontSize: "13px",
    color: "#666666",
    cursor: "pointer",
  },
  footer: {
    padding: "12px 16px",
    borderTop: "1px solid #E0E0E0",
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: "#00979D",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "4px",
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
}

export default WelcomeModal
