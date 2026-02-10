import { use, useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import AppShell from "./app/AppShell"
import AppRoutes from "./app/routes"
import { applyTheme, getInitialTheme} from "./app/theme"
import type { Theme } from "./app/theme"

import DomainSetupModal from "./components/DomainSetupModal"
import { getPrefferedDomain, setPrefferedDomain } from "./app/userSettings"
import type { Domain } from "./app/userSettings"

export default function App() {
  const [theme, setTheme] = useState<Theme>(()=> getInitialTheme())
  const [needsDomain, setNeedsDomain] = useState(false)

  useEffect(()=>{
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    setNeedsDomain(getPrefferedDomain() === null)
  }, [])

  return(
    <BrowserRouter>
      <AppShell theme= {theme} onToggleTheme={()=> setTheme((t)=> (t === 'dark' ? 'light' : 'dark'))}>
        <AppRoutes />
      </AppShell>
      <DomainSetupModal isOpen= {needsDomain} onConfirm={(domain: Domain)=> {
        setPrefferedDomain(domain);
        setNeedsDomain(false);
      }}/>
    </BrowserRouter>
  )
}