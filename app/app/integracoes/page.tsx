import { Topbar } from "@/components/shell/topbar";
import { WordpressForm } from "@/components/integrations/wordpress-form";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { getWordpressPublic } from "@/lib/data/integrations";

export default async function IntegracoesPage() {
  const { ws } = await requireActiveWorkspace();
  const wp = await getWordpressPublic(ws.id);

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Integrações" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight">Integrações</h1>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            Conecte as ferramentas deste workspace. Cada cliente usa as suas.
          </p>
        </div>

        <div className="space-y-4">
          <WordpressForm current={wp} />

          <div className="max-w-xl rounded-lg border border-dashed border-border bg-surface/50 p-4 text-[13px] text-text-muted">
            <span className="font-medium text-text-secondary">SEO (Search Console / Ahrefs / Semrush)</span> · em breve —
            quando conectados, as métricas deixam de ser ESTIMADO e passam a MEDIDO.
          </div>
          <div className="max-w-xl rounded-lg border border-dashed border-border bg-surface/50 p-4 text-[13px] text-text-muted">
            <span className="font-medium text-text-secondary">Pesquisa web (SERP)</span> · ativa (nativa) — usada na análise de pautas, rotulada OBSERVADO.
          </div>
        </div>
      </div>
    </>
  );
}
