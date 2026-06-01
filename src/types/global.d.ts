declare global {
  interface Window {
    ace: {
      edit: (_elementId: string) => AceEditor
      config: {
        set: (_key: string, _value: string) => void
      }
    }
    DEFAULT_SKETCH?: string
  }
}

interface AceEditor {
  setOptions: (_options: Record<string, unknown>) => void
  commands: {
    removeCommand: (_name: string) => void
  }
  session: {
    setMode: (_mode: string) => void
    setUseWorker: (_use: boolean) => void
    setValue: (_value: string) => void
    getUndoManager: () => { reset: () => void; isClean: () => boolean }
    selection: {
      moveTo: (_row: number, _col: number) => void
    }
    bgTokenizer: {
      tokenizer: {
        $setMaxTokenCount: (_max: number) => void
      }
    }
  }
  setValue: (_value: string) => void
  getValue: () => string
  clearSelection: () => void
  setTheme: (_theme: string) => void
  focus: () => void
  undo: () => void
  redo: () => void
  execCommand: (_command: string) => void
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
