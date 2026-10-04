import type { ButtonHTMLAttributes, ComponentType, HTMLAttributes, ReactNode } from 'react'

// Shared building blocks for every screen. They only use the semantic tokens from index.css, so they
// follow the active Biome's palette.

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent shadow-lift active:bg-accent-strong',
  secondary: 'bg-surface-raised text-ink ring-1 ring-line active:bg-line',
  ghost: 'text-ink-muted active:bg-surface-raised',
  danger: 'text-danger active:bg-danger-surface',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-1.5 rounded-control px-3 text-caption',
  md: 'min-h-11 gap-2 rounded-control px-4 text-body',
  lg: 'min-h-14 gap-2 rounded-card px-6 text-body',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
            className={`relative z-10 flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius-control)-4px)] px-3 text-caption font-bold transition-colors duration-200 ${
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
