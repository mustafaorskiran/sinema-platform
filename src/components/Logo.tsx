type LogoVariant = 'full' | 'horizontal' | 'icon' | 'wordmark'
type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  variant: LogoVariant
  size?: LogoSize
  className?: string
}

const ICON_PATHS = (
  <>
    <path d="M86,26 C64,14 34,20 30,40 C27,54 40,58 58,58" fill="none" stroke="#FFFFFF" strokeWidth={15} strokeLinecap="round" />
    <path d="M58,58 C76,58 94,62 90,80 C86,100 56,106 30,92" fill="none" stroke="#E50914" strokeWidth={15} strokeLinecap="round" />
    <polygon points="52,60 52,96 88,78" fill="#FFFFFF" />
  </>
)

// height (px) per size, per variant — width derives from each variant's native aspect ratio
const DIMENSIONS: Record<LogoVariant, Record<LogoSize, number>> = {
  icon:       { sm: 24, md: 32,  lg: 48  },
  horizontal: { sm: 24, md: 32,  lg: 44  },
  wordmark:   { sm: 20, md: 28,  lg: 40  },
  full:       { sm: 120, md: 160, lg: 220 },
}

const VIEWBOX: Record<LogoVariant, { w: number; h: number }> = {
  icon:       { w: 120, h: 120 },
  horizontal: { w: 420, h: 120 },
  wordmark:   { w: 400, h: 90 },
  full:       { w: 240, h: 300 },
}

export default function Logo({ variant, size = 'md', className }: LogoProps) {
  const { w, h } = VIEWBOX[variant]
  const height = DIMENSIONS[variant][size]
  const width = (w / h) * height

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={width}
      height={height}
      role="img"
      aria-label="Sinezon"
      className={className}
    >
      {(variant === 'icon' || variant === 'horizontal' || variant === 'full') && (
        variant === 'full'
          ? <g transform="translate(60,10)">{ICON_PATHS}</g>
          : ICON_PATHS
      )}
      {(variant === 'wordmark' || variant === 'horizontal') && (
        <text
          x={variant === 'horizontal' ? 132 : 0}
          y={variant === 'horizontal' ? 76 : 64}
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={800}
          fontSize={variant === 'horizontal' ? 54 : 58}
          letterSpacing={1}
          fill="#FFFFFF"
        >
          SINE<tspan fill="#E50914">Z</tspan>ON
        </text>
      )}
      {variant === 'full' && (
        <text
          x={120}
          y={270}
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={800}
          fontSize={46}
          letterSpacing={1}
          fill="#FFFFFF"
        >
          SINE<tspan fill="#E50914">Z</tspan>ON
        </text>
      )}
    </svg>
  )
}
