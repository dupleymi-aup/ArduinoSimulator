import React from "react"
import { Routes, Route } from "react-router-dom"
import Editor from "./screens/Editor"
import AdminApp from "./admin/AdminApp"
import { declareLanguageData } from "./utils/languages"

const App = () => {
  const [webLoaded, setWebLoaded] = React.useState<boolean>(false)

  React.useEffect(() => {
    declareLanguageData()

    const checkAceEditor = setInterval(() => {
      if (window.ace) {
        setWebLoaded(true)
        clearInterval(checkAceEditor)
      }
    }, 200)

    return () => clearInterval(checkAceEditor)
  }, [])

  if (!webLoaded) {
    return null
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<Editor />} />
    </Routes>
  )
}

export default App
