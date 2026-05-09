interface LogoProps {
  /**
   * Mantido por compatibilidade — atualmente usamos sempre o SVG verde.
   * Quando houver versão laranja em SVG, mapear aqui.
   */
  variant?: 'verde' | 'laranja'
  /** Renderiza o lockup com o slogan (logo + tagline). Default: false. */
  withSlogan?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const heights: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 28,
  md: 40,
  lg: 64,
}

export function Logo({
  variant: _variant = 'verde',
  withSlogan = false,
  size = 'md',
  className,
}: LogoProps) {
  const h = heights[size]
  const src = withSlogan ? '/logo_slogan.svg' : '/logo.svg'
  return (
    <img
      src={src}
      alt="Vivere"
      height={h}
      style={{ height: h, width: 'auto' }}
      decoding="async"
      loading="eager"
      className={className}
    />
  )
}
