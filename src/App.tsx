export default function App() {
  return (
    <main className="min-h-dvh bg-[var(--vivere-cream)] flex flex-col items-center justify-center px-6 text-center">
      <span className="text-3xl font-bold tracking-tight text-[var(--vivere-green)]">
        Vivere
      </span>
      <p className="mt-2 text-base text-[var(--vivere-text-muted)]">
        Marmitas personalizadas para o seu dia.
      </p>
      <div className="mt-10 rounded-2xl border border-[var(--vivere-border)] bg-white px-8 py-6 shadow-sm">
        <p className="text-sm font-medium text-[var(--vivere-text-muted)]">
          Configurador em construção
        </p>
        <button
          className="mt-4 w-full rounded-xl bg-[var(--vivere-green)] py-3 text-sm font-semibold text-white"
          disabled
        >
          Começar montagem
        </button>
      </div>
    </main>
  )
}
