import React from "react"
import { examples } from "../examples"
import { t } from "../utils/languages"
import {
  toolbarButton,
  dropdownContainer,
  dropdown,
  categorySection,
} from "../styles"

interface ToolbarExamplesProps {
  onLoadExample: (_: string, __: string) => void
  onClose: () => void
}

const ToolbarExamples = ({ onLoadExample, onClose }: ToolbarExamplesProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const toggleOpen = () => setIsOpen(!isOpen)

  React.useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleSelect = (content: string, name: string) => {
    onLoadExample(content, name)
    setIsOpen(false)
    onClose()
  }

  return (
    <div ref={containerRef} style={dropdownContainer}>
      <button style={toolbarButton} onClick={toggleOpen}>
        {t("EXAMPLES")}
      </button>
      {isOpen && (
        <div style={dropdown}>
          {examples.map((category, _i) => (
            <CategorySection
              key={category.category}
              category={category.category}
              sketches={category.sketches}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const CategorySection = ({
  category,
  sketches,
  onSelect,
}: {
  category: string
  sketches: { name: string; content: string }[]
  onSelect: (_content: string, _name: string) => void
}) => (
  <div style={categorySection.category}>
    <div style={categorySection.categoryTitle}>{category}</div>
    {sketches.map((sketch, _j) => (
      <div
        key={`${category}-${sketch.name}`}
        onClick={() => onSelect(sketch.content, sketch.name)}
        style={categorySection.sketch}
      >
        {sketch.name}
      </div>
    ))}
  </div>
)

export default ToolbarExamples
