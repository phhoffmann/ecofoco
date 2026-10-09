import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentType,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react'

// Shared building blocks for every screen. They only use the semantic tokens from index.css, so they
// follow the active Biome's palette. Every control is at least 44px tall (min-h-11 / size-11).

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent shadow-lift active:bg-accent-strong',
  secondary: 'bg-surface-raised text-ink ring-1 ring-line active:bg-line',
  ghost: 'text-ink-muted active:bg-surface-raised',
  danger: 'text-danger active:bg-danger-surface',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-11 gap-1.5 rounded-control px-3 text-caption',
  md: 'min-h-11 gap-2 rounded-control px-4 text-body',
  lg: 'min-h-14 gap-2 rounded-card px-6 text-body',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ComponentType<{ className?: string }>
}

export function Button({ variant = 'secondary', size = 'md', icon: Icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`press inline-flex items-center justify-center font-bold disabled:opacity-45 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'size-4' : 'size-5'} />}
      {children}
    </button>
  )
}

/** Square icon-only button; `label` becomes its accessible name. */
export function IconButton({
  icon: Icon,
  label,
  className = '',
  ...props
}: Omit<ButtonProps, 'icon' | 'children'> & { icon: ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      aria-label={label}
      className={`press inline-flex size-11 items-center justify-center rounded-control bg-surface-raised text-ink ring-1 ring-line active:bg-line disabled:opacity-30 ${className}`}
      {...props}
    >
      <Icon className="size-5" />
    </button>
  )
}

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-card bg-surface p-4 shadow-card ring-1 ring-line/60 ${className}`} {...props}>
      {children}
    </div>
  )
}

/** Card heading: icon chip, title and an optional trailing slot. */
export function CardHeader({
  icon: Icon,
  title,
  hint,
  trailing,
}: {
  icon?: ComponentType<{ className?: string }>
  title: ReactNode
  hint?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent/15 text-accent">
          <Icon className="size-5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-body font-extrabold text-ink">{title}</p>
        {hint && <p className="text-caption text-ink-faint">{hint}</p>}
      </div>
      {trailing}
    </div>
  )
}

interface SegmentedControlProps<T extends string> {
  label: string
  options: readonly { value: T; label: string; icon?: ComponentType<{ className?: string }> }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Pill toggle with a thumb that slides to the selected option. Buttons expose aria-pressed. */
export function SegmentedControl<T extends string>({ label, options, value, onChange, className = '' }: SegmentedControlProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div role="group" aria-label={label} className={`relative flex rounded-control bg-surface-sunken p-1 ring-1 ring-line/60 ${className}`}>
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-[calc(var(--radius-control)-4px)] bg-accent shadow-lift transition-transform duration-300 ease-spring motion-reduce:transition-none"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((option) => {
        const selected = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius-control)-4px)] px-3 text-caption font-bold transition-colors duration-200 ${
              selected ? 'text-on-accent' : 'text-ink-muted'
            }`}
          >
            {Icon && <Icon className="size-4" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** On/off toggle exposed as role="switch"; the 44px hit area is wider than the visible track. */
export function Switch({
  checked,
  onChange,
  label,
  describedBy,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  describedBy?: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className="press flex h-11 w-14 shrink-0 items-center justify-center self-center"
    >
      <span
        aria-hidden
        className={`relative block h-7 w-12 rounded-full ring-1 transition-colors ${
          checked ? 'bg-accent ring-accent' : 'bg-surface-sunken ring-line'
        }`}
      >
        <span
          className={`absolute top-1 left-0 block size-5 rounded-full shadow transition-transform duration-300 ease-spring motion-reduce:transition-none ${
            checked ? 'translate-x-6 bg-on-accent' : 'translate-x-1 bg-ink'
          }`}
        />
      </span>
    </button>
  )
}

/** A settings row: title and hint on the left, a control on the right. */
export function SettingRow({
  title,
  hint,
  control,
}: {
  title: string
  hint?: string
  control: (ids: { describedBy?: string }) => ReactNode
}) {
  const hintId = useId()
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-body font-bold text-ink">{title}</p>
        {hint && (
          <p id={hintId} className="text-caption text-ink-faint">
            {hint}
          </p>
        )}
      </div>
      {control({ describedBy: hint ? hintId : undefined })}
    </div>
  )
}

/** How long Give up has to be held. Long enough to rule out a stray tap, short enough not to annoy. */
export const HOLD_TO_CONFIRM_MS = 1500

const HOLD_KEYS = new Set([' ', 'Enter'])

/**
 * A button that fires only after being held down, for actions that throw something away. A fill
 * shows the hold's progress; letting go early cancels. Space or Enter can be held the same way.
 */
export function HoldButton({
  onConfirm,
  holdMs = HOLD_TO_CONFIRM_MS,
  className = '',
  children,
}: {
  onConfirm: () => void
  holdMs?: number
  className?: string
  children: ReactNode
}) {
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | null>(null)
  const onConfirmRef = useRef(onConfirm)

  useEffect(() => {
    onConfirmRef.current = onConfirm
  }, [onConfirm])

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  function begin() {
    if (timer.current !== null) return
    setHolding(true)
    timer.current = window.setTimeout(() => {
      timer.current = null
      setHolding(false)
      onConfirmRef.current()
    }, holdMs)
  }

  function cancel() {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    setHolding(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!HOLD_KEYS.has(e.key)) return
    e.preventDefault()
    if (!e.repeat) begin()
  }

  return (
    <button
      type="button"
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={handleKeyDown}
      onKeyUp={(e) => HOLD_KEYS.has(e.key) && cancel()}
      onBlur={cancel}
      // A long press would otherwise open the WebView's context menu.
      onContextMenu={(e) => e.preventDefault()}
      data-holding={holding || undefined}
      className={`press relative inline-flex min-h-11 touch-none items-center justify-center gap-1.5 overflow-hidden rounded-control px-4 text-caption font-bold text-danger select-none ring-1 ring-danger/40 ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-danger-surface"
        style={{ width: holding ? '100%' : '0%', transition: holding ? `width ${holdMs}ms linear` : 'width 150ms ease-out' }}
      />
      <span className="relative">{children}</span>
    </button>
  )
}

export function Chip({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-surface-raised px-3 py-1 text-caption font-semibold text-ink-muted ring-1 ring-line/60 ${className}`}>
      {children}
    </span>
  )
}

export function Overline({ className = '', children }: { className?: string; children: ReactNode }) {
  return <p className={`text-overline text-ink-faint uppercase ${className}`}>{children}</p>
}

/** Friendly placeholder for empty lists and unavailable features: art, a line of copy, an optional action. */
export function EmptyState({
  art,
  title,
  body,
  action,
  className = '',
}: {
  art: ReactNode
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`enter flex flex-col items-center gap-3 px-6 py-8 text-center ${className}`}>
      <div className="relative flex size-28 items-center justify-center">
        <span aria-hidden className="glow-pulse absolute inset-2 rounded-full bg-accent/15 blur-xl" />
        <div className="relative">{art}</div>
      </div>
      <p className="text-title text-ink">{title}</p>
      {body && <p className="max-w-72 text-body text-ink-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
