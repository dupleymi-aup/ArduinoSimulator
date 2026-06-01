import React from "react"
import { t } from "../utils/languages"
import { sectionLabel } from "../styles"

const PinsDigitalLabel = React.memo(() => {
  return <div style={sectionLabel}>{t("DIGITAL_PINS")}</div>
})

export default PinsDigitalLabel
