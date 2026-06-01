// Shared style factories for common UI patterns
import React from "react"
import { typography, spacing } from "./tokens"

/**
 * Section label style — used for DIGITAL_PINS, ANALOG_PINS, SERIAL_MONITOR labels.
 * Identical across PinsDigitalLabel, PinsAnalogLabel, SerialMonitorLabel.
 */
export const sectionLabel: React.CSSProperties = {
  float: "left",
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSizeMd,
  lineHeight: typography.lineHeightCompact,
  fontWeight: typography.fontWeightBold,
  marginLeft: spacing.sm,
  marginRight: spacing.xxs,
  cursor: "default",
}

/**
 * Scrollable bar container — used for digital/analog pin bars.
 * Identical across PinsDigitalBar, PinsAnalogBar.
 */
export const scrollableBar = {
  container: {
    height: "26px",
    overflowY: "hidden",
  },
  noScrollbar: {
    overflowX: "scroll",
    overflowY: "hidden",
    outline: "none",
    height: "80px",
  },
  wrapper: {
    float: "left",
  },
} as const

/**
 * Toolbar button style — used for toolbar buttons.
 */
export const toolbarButton: React.CSSProperties = {
  backgroundColor: "#F2F2F2",
  border: "thin solid #F2F2F2",
  padding: "4px 10px",
  cursor: "pointer",
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSizeMd,
  marginLeft: spacing.xs,
  borderRadius: "2px",
}

/**
 * Category section style — used in dropdown menus.
 */
export const categorySection = {
  category: {
    borderBottom: "1px solid #E0E0E0",
  },
  categoryTitle: {
    backgroundColor: "#F2F2F2",
    padding: "4px 10px",
    fontWeight: typography.fontWeightBold,
    fontSize: typography.fontSizeSm,
    color: "#333333",
  },
  sketch: {
    padding: "6px 10px 6px 20px",
    cursor: "pointer",
    fontSize: typography.fontSizeMd,
    fontFamily: typography.fontFamily,
    color: "#333333",
  },
} as const

/**
 * Dropdown style — used for dropdown menus.
 */
export const dropdown: React.CSSProperties = {
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
}

/**
 * Container with relative positioning for dropdowns.
 */
export const dropdownContainer: React.CSSProperties = {
  position: "relative",
  float: "left",
  display: "flex",
  alignItems: "center",
  height: "40px",
}
