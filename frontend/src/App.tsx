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
  const isAuthenticated = !!localStorage.getItem('token')

  useEffect(()=>{
    applyTheme(theme)
  }, [theme])

  useEffect(()=>{
    if(isAuthenticated) {
      const savedDomain= localStorage.getItem('domain')
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
          <DomainSetupModal isOpen={needDomain} onConfirm={async(domain: Domain) => {
            await fetch('/api/auth/profile/update-domain',{
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({domain})
            });
            localStorage.setItem('domain', domain);
            setPrefferedDomain(domain);
            setNeedsDomain(false);
            window.location.reload();
          }} />
         </AppShell>
        </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}