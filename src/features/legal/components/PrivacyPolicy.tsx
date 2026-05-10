import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Logo } from '@/features/shared/components/Logo'
import { AppFooter } from '@/features/shared/components/AppFooter'

export function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-creme flex flex-col">
      <header className="sticky top-0 z-10 bg-creme/90 backdrop-blur-sm border-b border-borda px-5 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="h-9 w-9 rounded-xl bg-surface border border-borda flex items-center justify-center text-verde-escuro hover:bg-verde-escuro/5 transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </Link>
        <Logo variant="verde" size="sm" />
      </header>

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <h1 className="font-display font-semibold text-[32px] leading-[1.1] text-verde-escuro mb-2">
          Política de Privacidade
        </h1>
        <p className="text-sm text-texto-suave mb-8">Última atualização: 9 de maio de 2025.</p>

        <Section title="1. Quem somos">
          <p>Vivere Alimentos</p>
          <p>CNPJ: 63.053.609/0001-49</p>
          <p>R. Sezefredo da Costa Tôrres, 373 · Centro</p>
          <p>Santo Antônio da Patrulha · RS · CEP 95500-000</p>
          <p>Contato: WhatsApp (51) 8088-9884 · @viverealimentos</p>
        </Section>

        <Section title="2. Quais dados coletamos">
          <p>
            <strong>Inclusive antes da finalização do pedido:</strong> ao começar a usar o site, pedimos seu nome e telefone WhatsApp. Esses dados ficam salvos mesmo se você não concluir o pedido, para que possamos eventualmente te oferecer ajuda ou retomar de onde parou. Você pode pedir a exclusão a qualquer momento via WhatsApp.
          </p>
          <p className="mt-3">Quando você monta uma marmita personalizada e finaliza o pedido pelo nosso site, coletamos:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Nome</li>
            <li>Telefone (WhatsApp)</li>
            <li>Endereço de entrega (se você optar por entrega)</li>
            <li>Observações que você incluir no pedido</li>
            <li>Histórico de pedidos e marmitas favoritas (quando você usa o mesmo telefone)</li>
          </ul>
          <p className="mt-3">Não coletamos CPF, dados de cartão, senhas ou dados sensíveis.</p>
        </Section>

        <Section title="3. Por que coletamos">
          <ul className="list-disc pl-5 space-y-1">
            <li>Para preparar e entregar sua marmita.</li>
            <li>Para entrar em contato pelo WhatsApp confirmando o pedido.</li>
            <li>Para você poder repetir pedidos anteriores e usar suas marmitas favoritas em visitas futuras.</li>
          </ul>
        </Section>

        <Section title="4. Quem tem acesso">
          <p>
            Apenas a equipe da Vivere (sócios e atendentes do WhatsApp). Não compartilhamos seus dados com terceiros, exceto quando exigido por lei.
          </p>
        </Section>

        <Section title="5. Onde guardamos">
          <p>
            Em servidores do Supabase (provedor de banco de dados em nuvem) e do Vercel (provedor de hospedagem do site). Ambos com criptografia em trânsito (HTTPS) e em repouso.
          </p>
        </Section>

        <Section title="6. Quanto tempo guardamos">
          <ul className="list-disc pl-5 space-y-1">
            <li>Pedidos: por tempo indeterminado, para fins de histórico operacional e fiscal.</li>
            <li>Marmitas favoritas: enquanto você quiser. Você pode pedir a exclusão a qualquer momento.</li>
          </ul>
        </Section>

        <Section title="7. Seus direitos (LGPD)">
          <p>Você pode, a qualquer momento, solicitar:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Acesso aos seus dados.</li>
            <li>Correção de informações incorretas.</li>
            <li>Exclusão dos seus dados (exceto pedidos já pagos, que precisam ser mantidos por exigência fiscal).</li>
            <li>Confirmação de quais dados temos sobre você.</li>
          </ul>
          <p className="mt-3">
            Para exercer qualquer um desses direitos, envie mensagem pelo WhatsApp (51) 8088-9884 com o assunto &ldquo;Solicitação LGPD&rdquo;.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Usamos apenas armazenamento local do navegador (<code className="text-[13px] bg-verde-escuro/8 px-1.5 py-0.5 rounded">localStorage</code>) para guardar seu identificador de cliente — assim você não precisa digitar telefone e endereço toda vez. Não usamos cookies de publicidade nem rastreadores de terceiros.
          </p>
        </Section>

        <Section title="9. Alterações">
          <p>Esta política pode ser atualizada. A data no topo indica quando foi a última revisão.</p>
        </Section>

        <Section title="10. Dúvidas">
          <p>Qualquer dúvida sobre esta política, fale com a gente pelo WhatsApp.</p>
        </Section>
      </main>

      <AppFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-semibold text-[20px] text-verde-escuro mb-3">{title}</h2>
      <div className="text-base leading-relaxed text-texto space-y-2">{children}</div>
    </section>
  )
}
