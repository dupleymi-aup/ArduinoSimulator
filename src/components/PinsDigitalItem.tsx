import React from "react"

import { Gpio } from "../utils/interfaces"

interface PinsDigitalItemProps {
  gpio: Gpio
}

const PinsDigitalItem = React.memo(({ gpio }: PinsDigitalItemProps) => {
  return (
    <div
      role="status"
      aria-label={`Digital pin ${gpio.pinNumber} is ${gpio.isEnabled ? "high" : "low"}`}
      style={{
        backgroundColor: gpio.isEnabled ? "green" : "red",
        ...styles.container,
      }}
    >
      {gpio.pinNumber}
    </div>
  )
})

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    float: "left",
    width: "16px",
    height: "16px",
    borderRadius: "16px",
    marginTop: "4px",
    marginLeft: "4px",
    fontSize: "11px",
    fontFamily: "Arial",
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    cursor: "default",
  },
}

export default PinsDigitalItem
