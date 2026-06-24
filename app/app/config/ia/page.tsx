import { Topbar } from "@/components/shell/topbar";
import { AiSettingsForm } from "@/components/ai/ai-settings-form";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { getAiSettingsPublic } from "@/lib/data/ai-settings";

export default async function AiConfigPage() {
  const { ws } = await requireActiveWorkspace();
  const current = await getAiSettingsPublic(ws.id);

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Configurações · IA" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight">Provedor de IA</h1>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            Escolha o provedor e cole a chave deste workspace. Cada cliente pode usar
            sua própria IA. {current ? `Ativo: ${current.provider} · ${current.model}.` : "Ainda não configurado."}
          </p>
        </div>
        <AiSettingsForm current={current} />
      </div>
    </>
  );
}
