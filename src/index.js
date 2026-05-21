import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { SimulatorContextProvider } from "./contexts/SimulatorContext"
import { TrackingProvider } from "./contexts/TrackingContext"
import ErrorBoundary from "./components/ErrorBoundary"
import App from "./App"

// Global focus indicator styles for keyboard navigation
// These provide visible focus outlines only for keyboard users
const focusStyleEl = document.createElement("style")
focusStyleEl.id = "arduino-sim-focus-styles"
focusStyleEl.textContent = `
  *:focus-visible {
    outline: 2px solid #0066cc !important;
    outline-offset: 2px;
  }
  button:focus-visible {
    outline: 2px solid #0066cc !important;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.2);
  }
  input:focus-visible, textarea:focus-visible, select:focus-visible {
    outline: 2px solid #0066cc !important;
    outline-offset: 1px;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
  }
  *:focus:not(:focus-visible) {
    outline: none !important;
  }
`
if (!document.getElementById("arduino-sim-focus-styles")) {
  document.head.appendChild(focusStyleEl)
}

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <BrowserRouter>
    <ErrorBoundary>
      <SimulatorContextProvider>
        <TrackingProvider>
          <App />
        </TrackingProvider>
      </SimulatorContextProvider>
    </ErrorBoundary>
  </BrowserRouter>
)
