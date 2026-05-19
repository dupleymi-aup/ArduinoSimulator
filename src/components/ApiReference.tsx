import React from "react"
import { t } from "../utils/languages"

interface ApiReferenceProps {
  onClose: () => void
}

const ApiReference = ({ onClose }: ApiReferenceProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(true)

  const toggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    if (!newState) onClose()
  }

  const getBadgeStyle = (status: string): React.CSSProperties => ({
    backgroundColor:
      status === "supported"
        ? "#33CC33"
        : status === "partial"
          ? "#FFCC00"
          : "#CC3333",
    color: status === "partial" ? "#333333" : "#FFFFFF",
    display: "inline-block",
    padding: "1px 6px",
    borderRadius: "3px",
    fontSize: "10px",
    fontWeight: "bold",
  })

  const functions = [
    {
      name: "pinMode(pin, mode)",
      status: "supported",
      notes: "INPUT, OUTPUT, INPUT_PULLUP",
    },
    { name: "digitalWrite(pin, value)", status: "supported", notes: "HIGH, LOW" },
    {
      name: "digitalRead(pin)",
      status: "supported",
      notes: "Returns user input state",
    },
    { name: "analogWrite(pin, value)", status: "supported", notes: "PWM 0-255" },
    {
      name: "analogRead(pin)",
      status: "supported",
      notes: "Returns user input 0-1023",
    },
    { name: "delay(ms)", status: "supported", notes: "" },
    {
      name: "delayMicroseconds(us)",
      status: "partial",
      notes: "Scaled to milliseconds",
    },
    {
      name: "pulseIn(pin, state)",
      status: "partial",
      notes: "Simulated from user input",
    },
    { name: "millis()", status: "supported", notes: "1-second resolution" },
    { name: "micros()", status: "supported", notes: "1-second resolution" },
    { name: "random(max)", status: "supported", notes: "" },
    { name: "random(min, max)", status: "supported", notes: "" },
    { name: "randomSeed(seed)", status: "supported", notes: "" },
    { name: "Serial.begin(baud)", status: "supported", notes: "" },
    { name: "Serial.print()", status: "supported", notes: "" },
    { name: "Serial.println()", status: "supported", notes: "" },
    { name: "Serial.available()", status: "supported", notes: "" },
    { name: "Serial.read()", status: "supported", notes: "" },
    { name: "EEPROM.read(addr)", status: "supported", notes: "4KB in-memory" },
    { name: "EEPROM.write(addr, val)", status: "supported", notes: "4KB in-memory" },
    { name: "EEPROM.get()", status: "supported", notes: "4KB in-memory" },
    { name: "EEPROM.put()", status: "supported", notes: "4KB in-memory" },
    { name: "EEPROM.update()", status: "supported", notes: "4KB in-memory" },
    { name: "tone()", status: "not_supported", notes: "" },
    { name: "noTone()", status: "not_supported", notes: "" },
    { name: "attachInterrupt()", status: "not_supported", notes: "" },
    { name: "SPI", status: "not_supported", notes: "" },
    { name: "Wire (I2C)", status: "not_supported", notes: "" },
    { name: "Servo", status: "not_supported", notes: "" },
    { name: "LiquidCrystal", status: "not_supported", notes: "" },
  ]

  if (!isOpen) return null

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>{t("API_REFERENCE")}</span>
        <button style={styles.closeButton} onClick={toggle}>
          &times;
        </button>
      </div>
      <div style={styles.body}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Function</th>
              <th style={styles.thStatus}>{t("API_STATUS")}</th>
              <th style={styles.th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {functions.map((fn, idx) => (
              <tr key={idx}>
                <td style={styles.tdName}>{fn.name}</td>
                <td style={styles.tdStatus}>
                  <span
                    style={getBadgeStyle(fn.status)}
                  >
                    {fn.status === "supported"
                      ? t("API_SUPPORTED")
                      : fn.status === "partial"
                        ? t("API_PARTIAL")
                        : t("API_NOT_SUPPORTED")}
                  </span>
                </td>
                <td style={styles.td}>{fn.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "Arial",
    fontSize: "12px",
    backgroundColor: "#FFFFFF",
    borderTop: "2px solid #00979D",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 8px",
    backgroundColor: "#00979D",
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "transparent",
    color: "#FFFFFF",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    lineHeight: 1,
  },
  body: {
    maxHeight: "200px",
    overflowY: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "4px 8px",
    borderBottom: "2px solid #E0E0E0",
    backgroundColor: "#F2F2F2",
    position: "sticky",
    top: 0,
  },
  thStatus: {
    padding: "4px 8px",
    borderBottom: "2px solid #E0E0E0",
    backgroundColor: "#F2F2F2",
    width: "100px",
    textAlign: "center",
    position: "sticky",
    top: 0,
  },
  tdName: {
    padding: "3px 8px",
    fontFamily: "monospace",
    fontSize: "11px",
    borderBottom: "1px solid #F0F0F0",
  },
  tdStatus: {
    padding: "3px 8px",
    textAlign: "center",
    borderBottom: "1px solid #F0F0F0",
  },
  td: {
    padding: "3px 8px",
    borderBottom: "1px solid #F0F0F0",
    color: "#666666",
  },
}

export default ApiReference
