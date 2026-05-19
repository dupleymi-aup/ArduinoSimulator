import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { SimulatorContextProvider } from "./contexts/SimulatorContext"
import { TrackingProvider } from "./contexts/TrackingContext"
import ErrorBoundary from "./components/ErrorBoundary"
import App from "./App"

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
