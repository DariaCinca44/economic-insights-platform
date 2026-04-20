import {useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppShell from "./app/AppShell"
import AppRoutes from "./app/routes"
import Login from "./pages/Login"
import { applyTheme, getInitialTheme} from "./app/theme"
import type { Theme } from "./app/theme"
import {setPrefferedDomain } from "./app/userSettings"
import PrivateRoute from "./components/PrivateRoute"
import DomainSetupModal from "./components/DomainSetupModal"
import { type Domain } from "./app/userSettings"

export default function App() {
  const [theme, setTheme] = useState<Theme>(()=> getInitialTheme())
  const [needDomain, setNeedsDomain] = useState(false)
  const isAuthenticated = !!sessionStorage.getItem('token')

  useEffect(()=>{
    applyTheme(theme)
  }, [theme])

  useEffect(()=>{
    if(isAuthenticated) {
      const savedDomain= sessionStorage.getItem('domain')
      const isMissing = !savedDomain || savedDomain === 'null' || savedDomain === 'undefined'
      setNeedsDomain(isMissing)
    }
  }, [isAuthenticated])

  return(
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path="/*" element={
        <PrivateRoute>
          <AppShell theme={theme} onToggleTheme={() => setTheme((t)=> (t === 'dark' ? 'light': 'dark'))}>
          <AppRoutes />
          {needDomain && (
          <DomainSetupModal onConfirm={async(domain: string) => {
              sessionStorage.setItem('domain', domain);
              setPrefferedDomain(domain as Domain);
              setNeedsDomain(false);
              window.location.reload();
          }} />
          )}
         </AppShell>
        </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}