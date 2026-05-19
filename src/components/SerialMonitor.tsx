import React from "react"
import SerialMonitorLabel from "./SerialMonitorLabel"
import SerialMonitorInput from "./SerialMonitorInput"
import SerialMonitorButton from "./SerialMonitorButton"
import SerialMonitorData from "./SerialMonitorData"
import SerialMonitorLineEnding from "./SerialMonitorLineEnding"
import { sendSerialData } from "../utils/interpreter"
import { useSimulatorContext } from "../contexts/SimulatorContext"
import { useEventTracking } from "../hooks/useEventTracking"

const SerialMonitor = () => {
  const { simulatorRunning } = useSimulatorContext()
  const track = useEventTracking()
  const [inputValue, setInputValue] = React.useState<string>("")
  const [lineEnding, setLineEnding] = React.useState<string>("")

  const _sendSerialData = () => {
    sendSerialData(inputValue + lineEnding)
    track("serial_send", { data: inputValue + lineEnding })
    setInputValue("")
  }

  React.useEffect(() => {
    if (!simulatorRunning) {
      setInputValue("")
    }
  }, [simulatorRunning])

  return (
    <div style={styles.container}>
      <SerialMonitorLabel />
      <div style={styles.inputRow}>
        <div style={styles.inputWrapper}>
          <SerialMonitorInput
            sendSerialData={_sendSerialData}
            value={inputValue}
            onChange={setInputValue}
            simulatorRunning={simulatorRunning}
          />
          <SerialMonitorButton
            sendSerialData={_sendSerialData}
            simulatorRunning={simulatorRunning}
          />
        </div>
        <SerialMonitorLineEnding value={lineEnding} onChange={setLineEnding} />
      </div>
      <SerialMonitorData />
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: "#F2F2F2",
    borderBottom: "1px solid #D3D3D3",
  },
  inputRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "0 4px",
  },
  inputWrapper: {
    display: "flex",
    flex: 1,
  },
}

export default SerialMonitor
