import React from "react"
import Toolbar from "../components/Toolbar"
import CodeEditor from "../components/CodeEditor"
import BottomPanel from "../components/BottomPanel"
import StatusBar from "../components/StatusBar"
import PinsDigitalBar from "../components/PinsDigitalBar"
import PinsAnalogBar from "../components/PinsAnalogBar"
import SerialMonitor from "../components/SerialMonitor"
import WelcomeModal from "../components/WelcomeModal"
import { useSimulatorContext } from "../contexts/SimulatorContext"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"
import {
  useAutosave,
  getAutosavedContent,
  clearAutosave,
} from "../hooks/useAutosave"
import {
  editorNew,
  editorSetValue,
  editorGetValue,
  editorSave,
  editorFocus,
} from "../utils/editor"
import { stopSimulator } from "../utils/interpreter"

const Editor = () => {
  const {
    setSimulatorRunning,
    filename,
    setFilename,
    setDigitalPins,
    setAnalogPins,
  } = useSimulatorContext()

  const [showConfirmMessage, setShowConfirmMessage] = React.useState<number | null>(null)
  const refUploader = React.useRef<HTMLInputElement>(null)
  const [showWelcome, setShowWelcome] = React.useState<boolean>(false)

  // eslint-disable-next-line no-unused-vars
  const initializeDigitalPins = [...Array(54)].map((_unused, index) => ({
    pinNumber: index,
    isInput: false,
    isEnabled: false,
  }))

  // eslint-disable-next-line no-unused-vars
  const initializeAnalogPins = [...Array(16)].map((_unused, index) => ({
    pinNumber: index,
    isInput: false,
    duty: 0,
  }))

  // Welcome modal on first visit
  React.useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("arduino-sim-welcome-shown")
    if (!hasSeenWelcome) {
      setShowWelcome(true)
    } else {
      // Check for autosaved content
      const autosaved = getAutosavedContent()
      if (autosaved) {
        editorSetValue(autosaved.content)
        if (autosaved.filename) {
          setFilename(autosaved.filename)
        }
      }
    }
  }, [setFilename])

  const handleWelcomeDismiss = (dontShowAgain: boolean) => {
    setShowWelcome(false)
    if (dontShowAgain) {
      localStorage.setItem("arduino-sim-welcome-shown", "true")
    }
    // Restore autosaved content on dismiss
    const autosaved = getAutosavedContent()
    if (autosaved && !editorGetValue()) {
      editorSetValue(autosaved.content)
      if (autosaved.filename) {
        setFilename(autosaved.filename)
      }
    }
  }

  const newFileAction = () => {
    stopSimulator()
    setSimulatorRunning(false)
    setDigitalPins(initializeDigitalPins)
    setAnalogPins(initializeAnalogPins)
    setFilename(null)
    editorNew()
    clearAutosave()
    setShowConfirmMessage(null)
  }

  const openFileAction = () => {
    stopSimulator()
    setDigitalPins(initializeDigitalPins)
    setAnalogPins(initializeAnalogPins)
    setSimulatorRunning(false)
    refUploader.current.click()
    setShowConfirmMessage(null)
  }

  const openFileConfirmed = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFileForUploading = event.target.files?.[0]
    if (!selectedFileForUploading) return
    const documentName = selectedFileForUploading.name
    setFilename(documentName)

    const filereader = new FileReader()
    filereader.onload = function () {
      editorSetValue(this.result as string)
      editorFocus()
      refUploader.current.value = ""
    }
    filereader.readAsText(selectedFileForUploading)
  }

  const saveFileAction = () => {
    editorSave(filename)
    clearAutosave()
  }

  useKeyboardShortcuts({
    onSave: saveFileAction,
    onRun: () => {},
    onStop: () => {},
    onNew: newFileAction,
    onOpen: openFileAction,
  })

  useAutosave(editorGetValue, filename)

  return (
    <>
      <Toolbar
        onNewFile={newFileAction}
        onOpenFile={openFileAction}
        onSaveFile={saveFileAction}
        onLoadExample={(content, name) => {
          editorSetValue(content)
          setFilename(name + ".ino")
          editorFocus()
        }}
        refUploader={refUploader}
        showConfirmMessage={showConfirmMessage}
        showLoading={false}
        setShowConfirmMessage={setShowConfirmMessage}
        openFileConfirmed={openFileConfirmed}
      />
      <CodeEditor />
      <BottomPanel>
        <PinsDigitalBar />
        <PinsAnalogBar />
        <SerialMonitor />
      </BottomPanel>
      <StatusBar />
      {showWelcome && <WelcomeModal onDismiss={handleWelcomeDismiss} />}
    </>
  )
}

export default Editor
