import React from "react"
import { examples } from "../examples"
import { t } from "../utils/languages"

interface ToolbarExamplesProps {
  onLoadExample: (_content: string, _name: string) => void
  onClose: () => void
}

const ToolbarExamples = ({ onLoadExample, onClose }: ToolbarExamplesProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)

  const toggleOpen = () => setIsOpen(!isOpen)

  const handleSelect = (content: string, name: string) => {
    onLoadExample(content, name)
    setIsOpen(false)
    onClose()
  }

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={toggleOpen}>
        {t("EXAMPLES")}
      </button>
      {isOpen && (
        <div style={styles.dropdown}>
          {examples.map((category) => (
            <div key={category.category} style={styles.category}>
              <div style={styles.categoryTitle}>{category.category}</div>
              {category.sketches.map((sketch) => (
                <div
                  key={`${category.category}-${sketch.name}`}
                  style={styles.sketch}
                  onClick={() => handleSelect(sketch.content, sketch.name)}
                >
                  {sketch.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "relative",
    float: "left",
    display: "flex",
    alignItems: "center",
    height: "40px",
  },
  button: {
    backgroundColor: "#F2F2F2",
    border: "thin solid #F2F2F2",
    padding: "4px 10px",
    cursor: "pointer",
    fontFamily: "Arial",
    fontSize: "13px",
    marginLeft: "3px",
    borderRadius: "2px",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "#FFFFFF",
    border: "1px solid #D3D3D3",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    zIndex: 1000,
    minWidth: "200px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  category: {
    borderBottom: "1px solid #E0E0E0",
  },
  categoryTitle: {
    backgroundColor: "#F2F2F2",
    padding: "4px 10px",
    fontWeight: "bold",
    fontSize: "12px",
    color: "#333333",
  },
  sketch: {
    padding: "6px 10px 6px 20px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "Arial",
    color: "#333333",
  },
}

export default ToolbarExamples
