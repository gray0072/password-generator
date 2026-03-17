# Password Generator

A fast, client-side password generator. No data leaves your browser.

**Live:** https://gray0072.github.io/password-generator/

## Features

- Generate 5 strong random passwords at once
- Configurable length (8–40 characters)
- Character groups: lowercase, uppercase, digits, special symbols
- Guaranteed at least one character from each enabled group
- Password quality indicator (entropy in bits, red → green bar)
- Light / Dark / System theme
- Settings saved to localStorage and restored on reload

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run deploy    # build + publish to GitHub Pages
```

## Tech stack

- [Vite](https://vitejs.dev/) + React 18 + TypeScript
- [Material UI v6](https://mui.com/)
- [react-hook-form](https://react-hook-form.com/)
