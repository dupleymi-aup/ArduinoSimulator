import React from "react"

interface UseKeyboardShortcutsProps {
  onSave: () => void
  onRun: () => void
  onStop: () => void
  onNew: () => void
  onOpen: () => void
}

export const useKeyboardShortcuts = ({
  onSave,
  onRun,
  onStop,
  onNew,
  onOpen,
}: UseKeyboardShortcutsProps) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const mod = isMac ? e.metaKey : e.ctrlKey

      if (mod && e.key === "s") {
        e.preventDefault()
        onSave()
      } else if (mod && e.key === "r" && !e.shiftKey) {
        e.preventDefault()
        onRun()
      } else if (mod && e.shiftKey && e.key === "R") {
        e.preventDefault()
        onStop()
      } else if (mod && e.key === "n") {
        e.preventDefault()
        onNew()
      } else if (mod && e.key === "o") {
        e.preventDefault()
        onOpen()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onSave, onRun, onStop, onNew, onOpen])
}
