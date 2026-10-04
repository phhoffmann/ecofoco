import type { ReactNode, SVGProps } from 'react'

// A small hand-drawn icon set: 24×24, 2px round strokes in currentColor. Decorative by default.
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>

function Svg({ className = 'size-5', children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export function SproutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20v-8" />
      <path d="M12 12c-4.2 0-6.5-2.2-6.5-6.5 4.2 0 6.5 2.3 6.5 6.5Z" />
      <path d="M12 10c0-3.6 2-5.6 6.5-5.6 0 3.6-2.1 5.6-6.5 5.6Z" />
      <path d="M7 20h10" />
    </Svg>
  )
}

export function FootprintsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 3.5c1.9 0 3 2 3 4.6 0 2.4-1.2 3.9-3 3.9S5 10.5 5 8.1C5 5.5 6.1 3.5 8 3.5Z" />
      <path d="M6.6 15.2h2.8v1.6a1.4 1.4 0 0 1-2.8 0Z" />
      <path d="M16 7.5c1.9 0 3 2 3 4.6 0 2.4-1.2 3.9-3 3.9s-3-1.5-3-3.9c0-2.6 1.1-4.6 3-4.6Z" />
      <path d="M14.6 19.2h2.8v.8a1.4 1.4 0 0 1-2.8 0Z" />
    </Svg>
  )
}

export function CollectionIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <path d="M14 20.5c0-4 2.3-6.5 6.5-6.5 0 4-2.4 6.5-6.5 6.5Z" />
    </Svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h9M19 7h1M4 17h3M13 17h7" />
      <circle cx="16" cy="7" r="2.5" />
      <circle cx="10" cy="17" r="2.5" />
    </Svg>
  )
}

export function GridIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Svg>
  )
}

export function GardenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 21 8l-9 4.5L3 8Z" />
      <path d="M3 8v7.5l9 4.5 9-4.5V8" />
      <path d="M12 12.5V20" />
    </Svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m15 5-7 7 7 7" />
    </Svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
    </Svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Svg>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function TimerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 10v3.5l2.5 2M9.5 2.5h5" />
    </Svg>
  )
}

export function MapPinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s-7-6.2-7-11.2a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.8" r="2.5" />
    </Svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </Svg>
  )
}

export function SparkleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" />
    </Svg>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4v5h-5" />
    </Svg>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3Z" />
    </Svg>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15Z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </Svg>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 5.5c2.6-1 6-1 9 1 3-2 6.4-2 9-1v13c-2.6-1-6-1-9 1-3-2-6.4-2-9-1Z" />
      <path d="M12 6.5v13" />
    </Svg>
  )
}

export function LeafIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 19c0-8.3 5-14 14.5-14C19.5 14 14 19 5 19Z" />
      <path d="m5 19 7.5-7.5" />
    </Svg>
  )
}

export function PawIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 14.5c1-2 2.4-3 4-3s3 1 4 3 .6 4.5-1.6 4.5c-1 0-1.6-.6-2.4-.6s-1.4.6-2.4.6c-2.2 0-2.6-2.5-1.6-4.5Z" />
      <circle cx="6" cy="10" r="1.6" />
      <circle cx="9.5" cy="6.5" r="1.6" />
      <circle cx="14.5" cy="6.5" r="1.6" />
      <circle cx="18" cy="10" r="1.6" />
    </Svg>
  )
}

export function XCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </Svg>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Svg>
  )
}
