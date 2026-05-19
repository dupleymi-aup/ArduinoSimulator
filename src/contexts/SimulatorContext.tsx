import React from "react"

import { Gpio, Gpio_Analog } from "../utils/interfaces"

interface SimulatorContextType {
  filename: null | string
  setFilename: React.Dispatch<React.SetStateAction<string | null>>
  boardType: null | string
  setBoardType: React.Dispatch<React.SetStateAction<string | null>>
  digitalPins: null | Gpio[]
  setDigitalPins: React.Dispatch<React.SetStateAction<null | Gpio[]>>
  handleSetDigitalPins: (index: number, state: boolean) => void
  analogPins: null | Gpio_Analog[]
  setAnalogPins: React.Dispatch<React.SetStateAction<null | Gpio_Analog[]>>
  handleSetAnalogPins: (index: number, duty: number) => void
  outputData: null | string
  setOutputData: React.Dispatch<React.SetStateAction<string>>
  simulatorRunning: boolean
  setSimulatorRunning: React.Dispatch<React.SetStateAction<boolean>>
  runtimeError: string | null
  setRuntimeError: React.Dispatch<React.SetStateAction<string | null>>
}

export const initializeDigitalPins = Array(54)
  .fill(null)
  .map((_, index) => ({
    pinNumber: index,
    isInput: false,
    isEnabled: false,
  }))

export const initializeAnalogPins = Array(16)
  .fill(null)
  .map((_, index) => ({
    pinNumber: index,
    isInput: false,
    duty: 0,
  }))

const SimulatorContext = React.createContext<SimulatorContextType>({
  filename: null,
  setFilename: () => {},
  boardType: null,
  setBoardType: () => {},
  digitalPins: initializeDigitalPins,
  setDigitalPins: () => {},
  analogPins: initializeAnalogPins,
  handleSetDigitalPins: (_index: number, _state: boolean) => {},
  setAnalogPins: () => {},
  handleSetAnalogPins: (_index: number, _duty: number) => {},
  outputData: null,
  setOutputData: () => {},
  simulatorRunning: false,
  setSimulatorRunning: () => {},
  runtimeError: null,
  setRuntimeError: () => {},
})

export function SimulatorContextProvider({ children }: { children: React.ReactNode }) {
  const [filename, setFilename] = React.useState<string | null>(null)
  const [boardType, setBoardType] = React.useState<string | null>(null)
  const [digitalPins, setDigitalPins] = React.useState<Gpio[]>(initializeDigitalPins)
  const [analogPins, setAnalogPins] =
    React.useState<Gpio_Analog[]>(initializeAnalogPins)
  const [outputData, setOutputData] = React.useState<string>("")
  const [simulatorRunning, setSimulatorRunning] = React.useState<boolean>(false)
  const [runtimeError, setRuntimeError] = React.useState<string | null>(null)

  const handleSetDigitalPins = React.useCallback((pinIndex: number, state: boolean) => {
    setDigitalPins((prevDigitalPins) => {
      const newDigitalPins = [...prevDigitalPins]
      newDigitalPins[pinIndex] = { ...newDigitalPins[pinIndex], isEnabled: state }
      return newDigitalPins
    })
  }, [])

  const handleSetAnalogPins = React.useCallback((pinIndex: number, duty: number) => {
    setAnalogPins((prevAnalogPins) => {
      const newAnalogPins = [...prevAnalogPins]
      newAnalogPins[pinIndex] = { ...newAnalogPins[pinIndex], duty }
      return newAnalogPins
    })
  }, [])

  const contextValue = React.useMemo(
    () => ({
      filename,
      setFilename,
      boardType,
      setBoardType,
      digitalPins,
      setDigitalPins,
      handleSetDigitalPins,
      analogPins,
      setAnalogPins,
      handleSetAnalogPins,
      outputData,
      setOutputData,
      simulatorRunning,
      setSimulatorRunning,
      runtimeError,
      setRuntimeError,
    }),
    [filename, boardType, digitalPins, analogPins, outputData, simulatorRunning, runtimeError, handleSetDigitalPins, handleSetAnalogPins]
  )

  return (
    <SimulatorContext.Provider value={contextValue}>
      {children}
    </SimulatorContext.Provider>
  )
}

export function useSimulatorContext() {
  return React.useContext(SimulatorContext)
}
