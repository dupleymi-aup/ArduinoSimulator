import React from "react"
import PinsDigitalLabel from "./PinsDigitalLabel"
import PinsDigitalItem from "./PinsDigitalItem"
import { useSimulatorContext } from "../contexts/SimulatorContext"
import { isMega } from "../utils/service"
import { scrollableBar } from "../styles"

const PinsDigitalBar = () => {
  const { digitalPins, boardType } = useSimulatorContext()
  const isMegaBoard = isMega(boardType)

  return (
    <div style={scrollableBar.container}>
      <div style={scrollableBar.noScrollbar}>
        <div
          style={{
            width: isMegaBoard ? "1250px" : "550px",
            ...scrollableBar.wrapper,
          }}
        >
          <PinsDigitalLabel />
          {digitalPins.slice(0, 14).map((pin, _i) => (
            <PinsDigitalItem key={pin.pinNumber} gpio={pin} />
          ))}
          {isMegaBoard &&
            digitalPins
              .slice(14, 54)
              .map((pin, _i) => <PinsDigitalItem key={pin.pinNumber} gpio={pin} />)}
        </div>
      </div>
    </div>
  )
}

export default PinsDigitalBar
