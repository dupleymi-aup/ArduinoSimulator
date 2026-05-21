declare global {
  interface Window {
    ace: {
      edit: (elementId: string) => AceEditor
      config: {
        set: (key: string, value: string) => void
      }
    }
    DEFAULT_SKETCH?: string
  }
}

interface AceEditor {
  setOptions: (options: Record<string, unknown>) => void
  commands: {
    removeCommand: (name: string) => void
  }
  session: {
    setMode: (mode: string) => void
    setUseWorker: (use: boolean) => void
    setValue: (value: string) => void
    getUndoManager: () => { reset: () => void; isClean: () => boolean }
    selection: {
      moveTo: (row: number, col: number) => void
    }
    bgTokenizer: {
      tokenizer: {
        $setMaxTokenCount: (max: number) => void
      }
    }
  }
  setValue: (value: string) => void
  getValue: () => string
  clearSelection: () => void
  setTheme: (theme: string) => void
  focus: () => void
  undo: () => void
  redo: () => void
  execCommand: (command: string) => void
  searchBox: {
    hide: () => void
  }
  renderer: {
    $cursorLayer: {
      element: {
        style: CSSStyleDeclaration
      }
    }
  }
}

export {}
