import React from "react"
import { t } from "../utils/languages"
import { sectionLabel } from "../styles"

const SerialMonitorLabel = React.memo(() => {
  return <div style={sectionLabel}>{t("SERIAL_MONITOR")}</div>
})

export default SerialMonitorLabel
