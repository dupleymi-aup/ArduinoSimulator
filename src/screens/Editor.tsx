import React from "react"
import Toolbar from "../components/Toolbar"
import CodeEditor from "../components/CodeEditor"
import BottomPanel from "../components/BottomPanel"
import StatusBar from "../components/StatusBar"
import PinsDigitalBar from "../components/PinsDigitalBar"
import PinsAnalogBar from "../components/PinsAnalogBar"
import SerialMonitor from "../components/SerialMonitor"
import WelcomeModal from "../components/WelcomeModal"
import {
  useSimulatorContext,
  initializeDigitalPins,
  initializeAnalogPins,
} from "../contexts/SimulatorContext"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"
import { useEventTracking } from "../hooks/useEventTracking"
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
import { startSimulator, stopSimulator } from "../utils/interpreter"

const Editor = () => {
  const {
    setSimulatorRunning,
    filename,
    setFilename,
    setDigitalPins,
    setAnalogPins,
    boardType,
    handleSetDigitalPins,
    handleSetAnalogPins,
    setOutputData,
    setRuntimeError,
  } = useSimulatorContext()
  const track = useEventTracking()

  const resetSimulatorState = React.useCallback(() => {
    stopSimulator()
    setDigitalPins(initializeDigitalPins)
    setAnalogPins(initializeAnalogPins)
    setSimulatorRunning(false)
  }, [setDigitalPins, setAnalogPins, setSimulatorRunning])

  const [showConfirmMessage, setShowConfirmMessage] = React.useState<number | null>(null)
  const refUploader = React.useRef<HTMLInputElement>(null)
  const [showWelcome, setShowWelcome] = React.useState<boolean>(false)
  const [showLoading, setShowLoading] = React.useState<boolean>(false)

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
    resetSimulatorState()
    track("file_new")
    track("sim_stop")
    setFilename(null)
    editorNew()
    clearAutosave()
    setShowConfirmMessage(null)
  }

  const openFileAction = () => {
    resetSimulatorState()
    refUploader.current.click()
    setShowConfirmMessage(null)
  }

  const openFileConfirmed = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFileForUploading = event.target.files?.[0]
    if (!selectedFileForUploading) return
    const documentName = selectedFileForUploading.name
    setFilename(documentName)
    track("file_open", { filename: documentName })

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
    track("file_save", { filename })
    clearAutosave()
  }

  const stopSketch = React.useCallback(() => {
    resetSimulatorState()
    track("sim_stop")
  }, [resetSimulatorState, track])

  const startSketch = React.useCallback(() => {
    setShowLoading(true)
    track("sim_start", { sketchName: filename, boardType })
    startSimulator(
      () => setShowLoading(false),
      setSimulatorRunning,
      handleSetDigitalPins,
      handleSetAnalogPins,
      setOutputData,
      setRuntimeError
    )
  }, [
    track,
    filename,
    boardType,
    setSimulatorRunning,
    handleSetDigitalPins,
    handleSetAnalogPins,
    setOutputData,
    setRuntimeError,
  ])

  useKeyboardShortcuts({
    onSave: saveFileAction,
    onRun: startSketch,
    onStop: stopSketch,
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
          track("file_example_load", { exampleName: name })
          editorFocus()
        }}
        onStart={startSketch}
        onStop={stopSketch}
        onCleanEditor={newFileAction}
        onUploadFile={openFileAction}
        refUploader={refUploader}
        showConfirmMessage={showConfirmMessage}
        showLoading={showLoading}
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
