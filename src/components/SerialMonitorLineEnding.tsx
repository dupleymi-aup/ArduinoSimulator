import React from "react"
import { t } from "../utils/languages"

interface SerialMonitorLineEndingProps {
  value: string
  onChange: (_value: string) => void
}

const LINE_ENDINGS = [
  { value: "", label: t("LINE_ENDING_NONE") },
  { value: "\n", label: t("LINE_ENDING_NEWLINE") },
  { value: "\r", label: t("LINE_ENDING_CR") },
  { value: "\r\n", label: t("LINE_ENDING_BOTH") },
]

const SerialMonitorLineEnding = ({
  value,
  onChange,
}: SerialMonitorLineEndingProps) => {
  return (
    <select
      style={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={t("LINE_ENDING")}
    >
      {LINE_ENDINGS.map((opt, index) => (
        <option key={index} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  select: {
    fontFamily: "Arial",
    fontSize: "11px",
    padding: "2px 4px",
    border: "1px solid #D3D3D3",
    borderRadius: "2px",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
  },
}

export default SerialMonitorLineEnding
