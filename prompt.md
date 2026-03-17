# Prompt: Password Generator App

Build a client-side password generator as a single-page React + TypeScript app using Vite and Material UI v6.

## Requirements

### Generation
- Generate 5 passwords simultaneously on every settings change and on "Generate" button click
- Password length configurable via slider, range 8–40, default 20
- Four character groups (each toggled by checkbox, all enabled by default):
  - Lowercase: `a-z`
  - Uppercase: `A-Z`
  - Digits: `0-9`
  - Special: `!@#$%^&*()_+=-|\\/{}[]<>`
- After generating each password, verify that at least one character from every enabled group is present; regenerate until this holds

### UI
- MUI `Container` (maxWidth sm) centered layout
- Header row: title "Password generator" on the left, theme toggle on the right
- Slider for password length (shows current value as label)
- Checkboxes for each character group
- "Generate" button
- Password list: each item shows the password in monospace font, a Copy button (switches to "Copied" with green color for 2 s), and a strength bar below
- SVG favicon: lock icon on MUI blue (`#1976d2`) background

### Password strength bar
- Formula: `bits = length × log₂(poolSize)` where poolSize is the total count of characters in all enabled groups
- Display: MUI `LinearProgress` (height 6, rounded), color interpolated from red (0 bits) to green (128+ bits) via HSL hue 0→120
- Label: `Quality: N bits` in the same color

### Theme
- Three modes: Light, Dark, System (follows `prefers-color-scheme`)
- Toggle rendered as MUI `ToggleButtonGroup` with icons: `LightMode`, `SettingsBrightness`, `DarkMode`
- Selected mode persisted to `localStorage` key `password-generator-theme`

### Persistence
- Form settings (length + checkboxes) saved to `localStorage` key `password-generator-settings` on every change
- Settings restored from localStorage on page load; fall back to defaults if absent or invalid

## Stack
- Vite 5, React 18, TypeScript 5 (strict)
- `@mui/material` v6, `@emotion/react`, `@emotion/styled`
- `@mui/icons-material`
- `react-hook-form` (use `Controller` for MUI-controlled inputs)
- `gh-pages` for deployment

## File structure
```
index.html          # Vite entry, references /src/main.tsx
public/favicon.svg  # SVG lock icon
src/
  main.tsx          # ReactDOM.createRoot
  App.tsx           # ThemeProvider, ThemeContext (mode + setMode), CssBaseline
  PasswordForm.tsx  # All UI and logic
vite.config.ts      # base: '/password-generator/'
tsconfig.json
tsconfig.node.json
```

## Deployment
```bash
npm run deploy   # runs: tsc && vite build, then gh-pages -d dist
```
GitHub Pages URL: `https://<user>.github.io/password-generator/`
