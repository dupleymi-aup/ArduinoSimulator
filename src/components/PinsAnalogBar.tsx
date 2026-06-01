import React from "react"
import PinsAnalogLabel from "./PinsAnalogLabel"
import PinsAnalogItem from "./PinsAnalogItem"
import { useSimulatorContext } from "../contexts/SimulatorContext"
import { isMega, isNano } from "../utils/service"
import { scrollableBar } from "../styles"

const PinsAnalogBar = () => {
  const { analogPins, boardType } = useSimulatorContext()

  const isMegaBoard = isMega(boardType)
  const isNanoBoard = isNano(boardType)

  return (
    <div style={scrollableBar.container}>
      <div style={scrollableBar.noScrollbar}>
        <div
          style={{
            width: isMegaBoard ? "850px" : "550px",
            ...scrollableBar.wrapper,
          }}
        >
          <PinsAnalogLabel />
          {analogPins.slice(0, 6).map((pin, _i) => (
            <PinsAnalogItem key={pin.pinNumber} gpioAnalog={pin} />
          ))}
          {(isMegaBoard || isNanoBoard) &&
            analogPins
              .slice(6, 8)
              .map((pin, _i) => (
                <PinsAnalogItem key={pin.pinNumber} gpioAnalog={pin} />
              ))}
          {isMegaBoard &&
            analogPins
              .slice(8, 14)
              .map((pin, _i) => (
                <PinsAnalogItem key={pin.pinNumber} gpioAnalog={pin} />
              ))}
        </div>
      </div>
    </div>
  )
}

export default PinsAnalogBar
