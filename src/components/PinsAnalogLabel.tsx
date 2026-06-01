import React from "react"
import { t } from "../utils/languages"
import { sectionLabel } from "../styles"

const PinsAnalogLabel = React.memo(() => {
  return <div style={sectionLabel}>{t("ANALOG_PINS")}</div>
})

export default PinsAnalogLabel
