import React from "react"

interface UseKeyboardShortcutsOptions {
  tabNames: string[]
  onTabChange: (_tab: string) => void
  onLogout: () => void
}

interface ShortcutHelpState {
  visible: boolean
}

const SHORTCUTS = [
  { key: "Ctrl+1..9", description: "Switch to tab 1–9" },
  { key: "Ctrl+0", description: "Switch to tab 10" },
  { key: "Ctrl+Q / W / E", description: "Switch to tab 11 / 12 / 13" },
  { key: "Ctrl+R / T / Y", description: "Switch to tab 14 / 15 / 16" },
  { key: "Ctrl+U / I / O", description: "Switch to tab 17 / 18 / 19" },
  { key: "Ctrl+L", description: "Logout" },
  { key: "?", description: "Toggle this help dialog" },
]

function getTabForNumber(num: number, tabNames: string[]): string | null {
  if (num >= 1 && num <= tabNames.length) return tabNames[num - 1]
  return null
}

export function useKeyboardShortcuts({
  tabNames,
  onTabChange,
  onLogout,
}: UseKeyboardShortcutsOptions) {
  const [help, setHelp] = React.useState<ShortcutHelpState>({ visible: false })

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Close help with Escape
      if (e.key === "Escape" && help.visible) {
        e.preventDefault()
        setHelp({ visible: false })
        return
      }

      // Toggle help
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault()
        setHelp((prev) => ({ visible: !prev.visible }))
        return
      }

      // Logout: Ctrl+L
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault()
        onLogout()
        return
      }

      // Tab switching: Ctrl+1..9
      if (e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const tab = getTabForNumber(parseInt(e.key, 10), tabNames)
        if (tab) onTabChange(tab)
        return
      }

      // Tab switching: Ctrl+0 → tab 10
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault()
        const tab = getTabForNumber(10, tabNames)
        if (tab) onTabChange(tab)
        return
      }

      // Tab switching: Ctrl+Q..O → tabs 11–19
      if (e.ctrlKey && /^[qwertuiyo]$/.test(e.key.toLowerCase())) {
        e.preventDefault()
        // Q starts at offset 11, but we need to map: q=11,w=12,e=13,r=14,t=15,y=16,u=17,i=18,o=19
        const keyMap: Record<string, number> = {
          q: 11,
          w: 12,
          e: 13,
          r: 14,
          t: 15,
          y: 16,
          u: 17,
          i: 18,
          o: 19,
        }
        const tabNum = keyMap[e.key.toLowerCase()]
        if (tabNum) {
          const tab = getTabForNumber(tabNum, tabNames)
          if (tab) onTabChange(tab)
        }
        return
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [tabNames, onTabChange, onLogout, help.visible])

  const HelpModal = () => {
    if (!help.visible) return null
    return (
      <div style={styles.overlay} onClick={() => setHelp({ visible: false })}>
        <div
          style={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <div style={styles.header}>
            <h2 style={styles.title}>Keyboard Shortcuts</h2>
            <button
              style={styles.closeBtn}
              onClick={() => setHelp({ visible: false })}
              aria-label="Close keyboard shortcuts help"
            >
              ×
            </button>
          </div>
          <div style={styles.list}>
            {SHORTCUTS.map((s, _index) => (
              <div key={s.key} style={styles.row}>
                <kbd key={`${s.key}-kbd`} style={styles.kbd}>
                  {s.key}
                </kbd>
                <span key={`${s.key}-desc`} style={styles.desc}>
                  {s.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return { HelpModal: help.visible ? HelpModal : null }
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    maxWidth: 480,
    width: "90%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#666",
    lineHeight: 1,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  kbd: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 13,
    minWidth: 100,
    textAlign: "center",
  },
  desc: {
    fontSize: 14,
    color: "#333",
  },
}

export default useKeyboardShortcuts
