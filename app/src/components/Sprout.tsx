interface SproutProps {
  progress: number // 0 to 1
}

export function Sprout({ progress }: SproutProps) {
  const scale = 0.4 + progress * 0.6
  const percent = Math.round(progress * 100)

  return (
    <div
      className="relative flex size-56 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#34d399 ${percent}%, #064e3b ${percent}%)`,
      }}
    >
      <div className="flex size-48 items-center justify-center rounded-full bg-emerald-950">
        <span
          className="text-7xl transition-transform duration-300 ease-out"
          style={{ transform: `scale(${scale})` }}
        >
          🌱
        </span>
      </div>
    </div>
  )
}
