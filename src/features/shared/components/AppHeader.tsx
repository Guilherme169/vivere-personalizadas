import { ChevronLeft } from 'lucide-react'
import { Logo } from './Logo'

interface AppHeaderProps {
  onBack?: () => void
  showLogo?: boolean
  rightSlot?: React.ReactNode
}

export function AppHeader({ onBack, showLogo = true, rightSlot }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-creme">
      <div className="w-10">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-verde-escuro/8 active:scale-[0.96] transition-all"
            aria-label="Voltar"
          >
            <ChevronLeft size={24} className="text-verde-escuro" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="flex-1 flex justify-center">
        {showLogo && <Logo variant="verde" size="sm" />}
      </div>

      <div className="w-10 flex justify-end">
        {rightSlot}
      </div>
    </header>
  )
}
