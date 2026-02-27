"use client"
import { cn } from "@/lib/utils"

interface Props {
  label: string
  value: number
  target: number
  unit: string
  color: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function MacroRing({
  label,
  value,
  target,
  unit,
  color,
  size = 100,
  strokeWidth = 8,
  className,
}: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = target > 0 ? Math.min(value / target, 1) : 0
  const offset = circumference * (1 - ratio)
  const center = size / 2
  const over = value > target

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none"
            stroke="hsl(var(--secondary))"
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none transition-all duration-700 ease-out"
            stroke={over ? "#f87171" : color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none" style={{ color: over ? "#f87171" : color }}>
            {Math.round(value)}
          </span>
          <span className="text-[9px] text-muted-foreground leading-none mt-0.5">{unit}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{target}{unit}</p>
      </div>
    </div>
  )
}
