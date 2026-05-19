import React from "react"
import IconNew from "../assets/IconNew"
import IconOpen from "../assets/IconOpen"
import IconSave from "../assets/IconSave"
import IconUndo from "../assets/IconUndo"
import IconRedo from "../assets/IconRedo"
import IconSearch from "../assets/IconSearch"
import IconStart from "../assets/IconStart"
import IconStop from "../assets/IconStop"
import ToolbarItem from "./ToolbarItem"
import ToolbarBoard from "./ToolbarBoard"
import ToolbarFilename from "./ToolbarFilename"
import ToolbarSeparator from "./ToolbarSeparator"
import ToolbarExamples from "./ToolbarExamples"
import Loading from "./Loading"
import ConfirmBox from "./ConfirmBox"
import { useSimulatorContext, initializeDigitalPins, initializeAnalogPins } from "../contexts/SimulatorContext"
import { useEventTracking } from "../hooks/useEventTracking"
import {
  editorNew,
  editorUndo,
  editorRedo,
  editorSearch,
  editorIsDirty,
  editorEnable,
  editorDisable,
  editorFocus,
} from "../utils/editor"
import { startSimulator, stopSimulator } from "../utils/interpreter"
import { getBoards } from "../../src/utils/service"
import { t } from "../utils/languages"

interface ToolbarProps {
  onNewFile: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onLoadExample: (_content: string, _name: string) => void
  refUploader: React.RefObject<HTMLInputElement>
  showConfirmMessage: number | null
  showLoading: boolean
  setShowConfirmMessage: (v: number | null) => void
  openFileConfirmed: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Toolbar = ({
  onNewFile,
  onOpenFile,
  onSaveFile,
  onLoadExample,
  refUploader,
  showConfirmMessage,
  showLoading,
  setShowConfirmMessage,
  openFileConfirmed,
}: ToolbarProps) => {
  const {
    simulatorRunning,
    setSimulatorRunning,
    boardType,
    setBoardType,
    setDigitalPins,
    handleSetDigitalPins,
    setAnalogPins,
    handleSetAnalogPins,
    setOutputData,
    setRuntimeError,
    filename,
    setFilename,
  } = useSimulatorContext()
  const track = useEventTracking()

  const [showLoadingInternal, setShowLoadingInternal] =
    React.useState<boolean>(false)
  const NEW_FILE = 1
  const OPEN_FILE = 2

  const newFile = () => {
    if (editorIsDirty()) {
      editorDisable()
      setShowConfirmMessage(NEW_FILE)
    } else {
      onNewFile()
    }
  }

  const openFile = () => {
    if (editorIsDirty()) {
      editorDisable()
      setShowConfirmMessage(OPEN_FILE)
    } else {
      onOpenFile()
    }
  }

  const saveFile = () => {
    onSaveFile()
  }

  const cleanEditor = () => {
    stopSimulator()
    track("sim_stop")
    setSimulatorRunning(false)
    setDigitalPins(initializeDigitalPins)
    setAnalogPins(initializeAnalogPins)
    setFilename(null)
    editorNew()
    setShowConfirmMessage(null)
  }

  const uploadFile = () => {
    stopSimulator()
    setDigitalPins(initializeDigitalPins)
    setAnalogPins(initializeAnalogPins)
    setSimulatorRunning(false)
    refUploader.current.click()
    setShowConfirmMessage(null)
  }

  const hideConfirmMessageInternal = () => {
    editorEnable()
    setShowConfirmMessage(null)
    editorFocus()
  }

  const switchBoard = () => {
    const boardList = getBoards()
    const currentBoard = boardType ? boardType : boardList[0]
    let nextBoard = boardList[0]

    boardList.forEach((element: string, index: number) => {
      if (element === currentBoard && boardList.length - 1 > index) {
        nextBoard = boardList[index + 1]
      }
    })

    setBoardType(nextBoard)
    track("board_change", { boardType: nextBoard })
  }

  const startSketch = () => {
    setShowLoadingInternal(true)
    editorDisable()
    track("sim_start", { sketchName: filename, boardType })
    startSimulator(
      setShowLoadingInternal,
      setSimulatorRunning,
      handleSetDigitalPins,
      handleSetAnalogPins,
      setOutputData,
      setRuntimeError
    )
  }

  const stopSketch = () => {
    stopSimulator()
    track("sim_stop")
    setDigitalPins(initializeDigitalPins)
    setAnalogPins(initializeAnalogPins)
    setSimulatorRunning(false)
  }

  const acceptCallback = showConfirmMessage === NEW_FILE ? cleanEditor : uploadFile

  React.useEffect(() => {
    const styleId = "arduinosimulator-toolbar-styles"
    if (document.getElementById(styleId)) return

    const styleNode = document.createElement("style")
    styleNode.id = styleId
    const styleText = `
      .arduinosimulator_menu_item:hover{background-color:#E3E3E3 !important;border:thin solid #D3D3D3 !important;cursor:pointer !important}
      @media (pointer: coarse) { .arduinosimulator_menu_item:hover{background-color:#F2F2F2 !important;border:thin solid #F2F2F2 !important}
    `
    const styleTextNode = document.createTextNode(styleText)
    styleNode.appendChild(styleTextNode)
    document.getElementsByTagName("head")[0].appendChild(styleNode)

    return () => {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [])

  return (
    <>
      <div style={styles.container}>
        <div style={styles.menu_scroll}>
          <div style={styles.menu_wrapper}>
            <ToolbarItem onClick={newFile} tooltip={t("TOOLTIP_NEW")}>
              <IconNew width={16} height={16} />
            </ToolbarItem>
            <ToolbarItem onClick={openFile} tooltip={t("TOOLTIP_OPEN")}>
              <IconOpen width={16} height={16} />
            </ToolbarItem>
            <ToolbarItem onClick={saveFile} tooltip={t("TOOLTIP_SAVE")}>
              <IconSave width={16} height={16} />
            </ToolbarItem>
            <ToolbarSeparator />
            <ToolbarItem onClick={editorUndo} tooltip={t("TOOLTIP_UNDO")}>
              <IconUndo width={16} height={16} />
            </ToolbarItem>
            <ToolbarItem onClick={editorRedo} tooltip={t("TOOLTIP_REDO")}>
              <IconRedo width={16} height={16} />
            </ToolbarItem>
            <ToolbarSeparator />
            <ToolbarItem onClick={editorSearch} tooltip={t("TOOLTIP_SEARCH")}>
              <IconSearch width={24} height={24} />
            </ToolbarItem>
            <ToolbarSeparator />
            <ToolbarExamples onLoadExample={onLoadExample} onClose={() => {}} />
            <ToolbarSeparator />
            <ToolbarItem
              onClick={simulatorRunning ? undefined : switchBoard}
              disabled={simulatorRunning}
              tooltip={t("TOOLTIP_BOARD")}
            >
              <ToolbarBoard
                boardType={boardType}
                simulatorRunning={simulatorRunning}
              />
            </ToolbarItem>
            <ToolbarSeparator />
            {simulatorRunning && (
              <ToolbarItem onClick={stopSketch} tooltip={t("TOOLTIP_STOP")}>
                <IconStop width={17} height={17} />
              </ToolbarItem>
            )}
            {!simulatorRunning && (
              <ToolbarItem onClick={startSketch} tooltip={t("TOOLTIP_START")}>
                <IconStart width={17} height={17} />
              </ToolbarItem>
            )}
            <ToolbarSeparator />
            <ToolbarFilename />
          </div>
        </div>
      </div>
      <input
        ref={refUploader}
        type="file"
        style={styles.uploader}
        onChange={openFileConfirmed}
      />
      {(showLoading || showLoadingInternal) && <Loading />}
      {showConfirmMessage && (
        <ConfirmBox
          title={t("LOSECHANGES_TITLE")}
          message={t("LOSECHANGES_MESSAGE")}
          accept={t("LOSECHANGES_YES")}
          acceptCallback={acceptCallback}
          cancel={t("LOSECHANGES_NO")}
          cancelCallback={hideConfirmMessageInternal}
        />
      )}
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "40px",
    borderBottom: "thin solid #D3D3D3",
    overflowY: "hidden",
  },
  menu_scroll: {
    backgroundColor: "#F2F2F2",
    left: 0,
    right: 0,
    paddingTop: 0,
    paddingBottom: 0,
    height: "80px",
    overflowX: "scroll",
    overflowY: "hidden",
    outline: "none",
    textAlign: "center",
    fontFamily: "Arial",
    fontSize: "13px",
  },
  menu_wrapper: {
    float: "left",
    width: "550px",
  },
  uploader: {
    display: "none",
  },
}

export default Toolbar
