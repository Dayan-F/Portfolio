import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './context/LangContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LangProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </LangProvider>
    </ThemeProvider>
  </StrictMode>,
)
