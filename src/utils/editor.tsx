import { t } from "./languages"
import isMobileDevice from "./isMobileDevice"
import logger from "./logger"

const mobileDevice: boolean = isMobileDevice()

let editor = null

const editorInit = () => {
  window.ace.config.set("basePath", ".")

  editor = window.ace.edit("arduinosimulator_textcode")
  editor.setOptions({
    fontSize: "14px",
    showPrintMargin: false,
    showInvisibles: false,
    tabSize: 4,
    useSoftTabs: false,
    highlightActiveLine: false,
  })
  editor.commands.removeCommand("gotoline")
  editor.session.setMode("ace/mode/arduino")
  editor.setTheme("ace/theme/arduino_light")
  editor.session.setUseWorker(false)
  editor.setValue(window.DEFAULT_SKETCH ? window.DEFAULT_SKETCH : t("EMPTY_SKETCH"))
  editor.clearSelection()
  editor.selection.moveTo(0, 0)
  editor.session.getUndoManager().reset()
  editor.session.bgTokenizer.tokenizer.$setMaxTokenCount(999999)

  editorFocus()
}

const editorNew = () => {
  editor.session.setMode("ace/mode/arduino")
  editor.setTheme("ace/theme/arduino_light")
  editor.setValue("")
  editor.clearSelection()
  editor.selection.moveTo(0, 0)
  editor.session.getUndoManager().reset()
  editor.setOptions({ readOnly: false, highlightGutterLine: true })
  editor.renderer.$cursorLayer.element.style.display = "block"

  try {
    editor.searchBox.hide()
  } catch {
    // searchBox may not be initialized yet — non-critical
  }

  editorFocus()
}

const editorSetValue = (newContent: string | ArrayBuffer) => {
  editor.setValue(newContent)
  editor.clearSelection()
  editor.selection.moveTo(0, 0)
  editor.session.getUndoManager().reset()
}

const editorGetValue = () => {
  return editor.getValue()
}

const editorSave = (filename: string) => {
  try {
    const blobValue = new Blob([editor.getValue()], { type: "text/plain" })

    const link = document.createElement("a")
    link.style.display = "none"
    document.body.appendChild(link)
    link.href = URL.createObjectURL(blobValue)
    link.download = filename || t("FILENAME")
    link.click()
    link.remove()
  } catch (err) {
    logger.error("Editor save failed:", err)
  }

  editor.session.getUndoManager().reset()

  try {
    editor.searchBox.hide()
  } catch (err) {
    logger.error("Editor searchBox hide failed:", err)
  }

  editorFocus()
}

const editorUndo = () => {
  try {
    editor.undo()
    editor.focus()
    editor.clearSelection()
  } catch (err) {
    logger.error("Editor undo failed:", err)
  }
}

const editorRedo = () => {
  try {
    editor.redo()
    editor.focus()
    editor.clearSelection()
  } catch (err) {
    logger.error("Editor redo failed:", err)
  }
}

const editorSearch = () => {
  try {
    editor.execCommand("find")
  } catch {
    // Search dialog failed to open — non-critical, silently ignore
  }
}

const editorIsDirty = () => {
  try {
    return !editor.session.getUndoManager().isClean()
  } catch (err) {
    return false
  }
}

const editorEnable = () => {
  editor.setOptions({ readOnly: false, highlightGutterLine: true })
  editor.renderer.$cursorLayer.element.style.display = "block"
}

const editorDisable = () => {
  editor.setOptions({ readOnly: true, highlightGutterLine: false })
  editor.renderer.$cursorLayer.element.style.display = "none"
}

const editorFocus = () => {
  if (!mobileDevice) {
    setTimeout(() => {
      editor.focus()
    }, 100)
  }
}

export {
  editorInit,
  editorNew,
  editorSetValue,
  editorGetValue,
  editorSave,
  editorUndo,
  editorRedo,
  editorSearch,
  editorIsDirty,
  editorEnable,
  editorDisable,
  editorFocus,
}
