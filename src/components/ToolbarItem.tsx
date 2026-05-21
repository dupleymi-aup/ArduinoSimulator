import React from "react"

interface ToolbarItemProps {
  onClick: () => void
  disabled?: boolean
  tooltip?: string
  children: React.ReactNode
}

const ToolbarItem = ({ onClick, disabled, tooltip, children }: ToolbarItemProps) => {
  return (
    <div style={styles.item}>
      <button
        style={{
          ...styles.iconWrapper,
          ...(disabled ? styles.disabled : {}),
        }}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
        disabled={disabled}
        title={tooltip}
        aria-label={tooltip}
        className={disabled ? undefined : "arduinosimulator_menu_item"}
      >
        {children}
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  item: {
    float: "left",
    display: "flex",
    margin: 0,
    height: "40px",
    alignItems: "center",
  },
  iconWrapper: {
    display: "block",
    fontFamily: "Arial",
    fontSize: "15px",
    lineHeight: "32px",
    height: "28px",
    minWidth: "28px",
    backgroundColor: "#F2F2F2",
    border: "thin solid #F2F2F2",
    marginLeft: "3px",
    cursor: "pointer",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    userSelect: "none",
    paddingTop: "3px",
    paddingBottom: "1px",
    borderRadius: "2px",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
}

export default ToolbarItem
