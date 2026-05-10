import { Link } from 'react-router-dom'

export function AppFooter() {
  return (
    <footer className="w-full border-t border-borda bg-surface/60 px-6 py-6 text-center space-y-1">
      <p className="text-xs font-medium text-verde-escuro">Vivere · Marmitas personalizadas</p>
      <p className="text-[11px] text-texto-suave">
        R. Sezefredo da Costa Tôrres, 373 · Centro
      </p>
      <p className="text-[11px] text-texto-suave">
        Santo Antônio da Patrulha · RS · CEP 95500-000
      </p>
      <p className="text-[11px] text-texto-suave">CNPJ 63.053.609/0001-49</p>
      <p className="text-[11px] text-texto-suave mt-2">
        Instagram @viverealimentos · WhatsApp (51) 8088-9884
      </p>
      <p className="mt-3">
        <Link
          to="/privacidade"
          className="text-[11px] text-verde-escuro underline underline-offset-2"
        >
          Política de Privacidade
        </Link>
      </p>
    </footer>
  )
}
