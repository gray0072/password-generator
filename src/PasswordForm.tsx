import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  LinearProgress,
  List,
  ListItem,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import { useThemeMode } from './App'

type PasswordFormModel = {
  passwordLength: number
  useLowerCase: boolean
  useUpperCase: boolean
  useDigits: boolean
  useSpecial: boolean
}

const STORAGE_KEY = 'password-generator-settings'
const PASSWORDS_COUNT = 5
const GROUPS = {
  useLowerCase: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  useUpperCase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  useDigits: '0123456789'.split(''),
  useSpecial: '!@#$%^&*()_+=-|\\/{}[]<>'.split(''),
} as const

type GroupKey = keyof typeof GROUPS

const DEFAULT_VALUES: PasswordFormModel = {
  passwordLength: 20,
  useLowerCase: true,
  useUpperCase: true,
  useDigits: true,
  useSpecial: true,
}

function loadSettings(): PasswordFormModel {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_VALUES, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return DEFAULT_VALUES
}

function saveSettings(values: PasswordFormModel) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
}

function generatePassword(config: PasswordFormModel): string {
  const activeGroups = (Object.keys(GROUPS) as GroupKey[]).filter(k => config[k])
  if (activeGroups.length === 0) return ''
  const pool = activeGroups.flatMap(k => GROUPS[k])
  const length = Number(config.passwordLength)
  for (;;) {
    const chars = Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)])
    const valid = activeGroups.every(g => chars.some(c => (GROUPS[g] as string[]).includes(c)))
    if (valid) return chars.join('')
  }
}

function generatePasswords(config: PasswordFormModel): string[] {
  return Array.from({ length: PASSWORDS_COUNT }, () => generatePassword(config))
}

function calcEntropy(config: PasswordFormModel): number {
  const activeGroups = (Object.keys(GROUPS) as GroupKey[]).filter(k => config[k])
  const poolSize = activeGroups.reduce((sum, k) => sum + GROUPS[k].length, 0)
  if (poolSize === 0) return 0
  return Number(config.passwordLength) * Math.log2(poolSize)
}

function entropyColor(bits: number): string {
  const pct = Math.min(bits / 128, 1)
  return `hsl(${Math.round(pct * 120)}, 80%, 42%)`
}

function StrengthBar({ config }: { config: PasswordFormModel }) {
  const bits = calcEntropy(config)
  const pct = Math.min((bits / 128) * 100, 100)
  const color = entropyColor(bits)
  return (
    <Box sx={{ mt: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
      <Typography variant="caption" sx={{ color }}>
        Quality: {Math.round(bits)} bits
      </Typography>
    </Box>
  )
}

function ThemeToggle() {
  const { mode, setMode } = useThemeMode()
  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      size="small"
      onChange={(_, val) => { if (val) setMode(val) }}
      aria-label="theme"
    >
      <ToggleButton value="light" aria-label="light">
        <Tooltip title="Light"><LightModeIcon fontSize="small" /></Tooltip>
      </ToggleButton>
      <ToggleButton value="system" aria-label="system">
        <Tooltip title="System"><SettingsBrightnessIcon fontSize="small" /></Tooltip>
      </ToggleButton>
      <ToggleButton value="dark" aria-label="dark">
        <Tooltip title="Dark"><DarkModeIcon fontSize="small" /></Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default function PasswordForm() {
  const { control, handleSubmit, getValues, watch, reset } = useForm<PasswordFormModel>({
    defaultValues: loadSettings(),
  })

  const [passwords, setPasswords] = useState<string[]>([])
  const [copiedPasswords, setCopiedPasswords] = useState<Record<string, boolean>>({})

  const updatePasswords = () => setPasswords(generatePasswords(getValues()))

  useEffect(() => { reset(loadSettings()) }, [])

  useEffect(() => {
    const subscription = watch((values) => {
      saveSettings(values as PasswordFormModel)
      updatePasswords()
    })
    updatePasswords()
    return () => subscription.unsubscribe()
  }, [watch])

  const formValues = watch()
  const passwordLength = formValues.passwordLength

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPasswords(prev => ({ ...prev, [text]: true }))
    setTimeout(() => {
      setCopiedPasswords(prev => { const n = { ...prev }; delete n[text]; return n })
    }, 2000)
  }

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit(updatePasswords)} sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Password generator</Typography>
          <ThemeToggle />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Length: {passwordLength}</Typography>
          <Controller
            name="passwordLength"
            control={control}
            render={({ field }) => (
              <Slider
                {...field}
                min={8}
                max={40}
                valueLabelDisplay="auto"
                onChange={(_: Event, value: number | number[]) => field.onChange(value)}
              />
            )}
          />
        </Box>

        <Stack sx={{ mb: 2 }}>
          {([
            ['useLowerCase', 'Lower-case symbols: a-z'],
            ['useUpperCase', 'Upper-case symbols: A-Z'],
            ['useDigits', 'Digits: 0-9'],
            ['useSpecial', 'Special symbols: !@#$%^&*()_+=-|\\/{}[]<>'],
          ] as const).map(([name, label]) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label={label}
                />
              )}
            />
          ))}
        </Stack>

        <Button type="submit" variant="contained">Generate</Button>

        <List sx={{ mt: 2 }}>
          {passwords.map((pwd, index) => (
            <ListItem
              key={index}
              sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1.5 }}
              divider
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                <Typography fontFamily="monospace" sx={{ wordBreak: 'break-all', flexGrow: 1 }}>
                  {pwd}
                </Typography>
                <Button
                  size="small"
                  variant={copiedPasswords[pwd] ? 'outlined' : 'contained'}
                  color={copiedPasswords[pwd] ? 'success' : 'primary'}
                  startIcon={copiedPasswords[pwd] ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => copyToClipboard(pwd)}
                  sx={{ whiteSpace: 'nowrap', minWidth: 90, flexShrink: 0 }}
                >
                  {copiedPasswords[pwd] ? 'Copied' : 'Copy'}
                </Button>
              </Box>
              <StrengthBar config={formValues} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  )
}
