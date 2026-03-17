import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material'
import { createContext, useContext, useMemo, useState } from 'react'
import PasswordForm from './PasswordForm'

type ThemeMode = 'light' | 'dark' | 'system'

const THEME_KEY = 'password-generator-theme'

interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  setMode: () => {},
})

export function useThemeMode() {
  return useContext(ThemeContext)
}

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeMode) ?? 'system'
  })

  const setMode = (m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem(THEME_KEY, m)
  }

  const resolvedMode = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode

  const theme = useMemo(
    () => createTheme({ palette: { mode: resolvedMode } }),
    [resolvedMode]
  )

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PasswordForm />
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
