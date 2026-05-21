import React from "react"
import { Gpio_Analog } from "../utils/interfaces"

interface PinsAnalogItemProps {
  gpioAnalog: Gpio_Analog
}

const PinsAnalogItem = React.memo(({ gpioAnalog }: PinsAnalogItemProps) => {
  return (
    <div
      role="status"
      aria-label={`Analog pin A${gpioAnalog.pinNumber} duty cycle ${gpioAnalog.duty}`}
      style={styles.container}
    >
      {gpioAnalog.duty}
    </div>
  )
})

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    float: "left",
    width: "40px",
    height: "16px",
    borderRadius: "16px",
    marginTop: "4px",
    marginLeft: "4px",
    backgroundColor: "black",
    fontSize: "11px",
    fontFamily: "Arial",
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    cursor: "default",
  },
}

export default PinsAnalogItem
