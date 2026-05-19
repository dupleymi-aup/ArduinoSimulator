import React from "react"

const AUTOSAVE_KEY = "arduino-sim-autosave"
const AUTOSAVE_FILENAME_KEY = "arduino-sim-autosave-filename"
const AUTOSAVE_INTERVAL = 30000

export const useAutosave = (
  editorGetValue: () => string,
  filename: string | null
) => {
  React.useEffect(() => {
    const interval = setInterval(() => {
      const content = editorGetValue()
      if (content && content.trim() !== "") {
        localStorage.setItem(AUTOSAVE_KEY, content)
        if (filename) {
          localStorage.setItem(AUTOSAVE_FILENAME_KEY, filename)
        }
      }
    }, AUTOSAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [editorGetValue, filename])
}

export const getAutosavedContent = (): {
  content: string
  filename: string | null
} | null => {
  const content = localStorage.getItem(AUTOSAVE_KEY)
  const filename = localStorage.getItem(AUTOSAVE_FILENAME_KEY)
  if (content && content.trim() !== "") {
    return { content, filename }
  }
  return null
}

export const clearAutosave = () => {
  localStorage.removeItem(AUTOSAVE_KEY)
  localStorage.removeItem(AUTOSAVE_FILENAME_KEY)
}
