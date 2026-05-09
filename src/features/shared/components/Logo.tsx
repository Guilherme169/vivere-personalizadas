interface LogoProps {
  variant?: 'verde' | 'laranja'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const heights: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 28,
  md: 40,
  lg: 64,
}

export function Logo({ variant = 'verde', size = 'md', className }: LogoProps) {
  const h = heights[size]
  return (
    <img
      src={`/logo-${variant}.png`}
      alt="Vivere"
      height={h}
      style={{ height: h, width: 'auto' }}
      decoding="async"
      loading="eager"
      className={className}
    />
  )
}
