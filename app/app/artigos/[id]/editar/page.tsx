import { notFound, redirect } from "next/navigation";
import { Topbar } from "@/components/shell/topbar";
import { ArticleEditor } from "@/components/editor/article-editor";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { getArticleDetail } from "@/lib/data/article-detail";
import { atLeast } from "@/lib/auth/rbac";

export default async function EditarArtigoPage({ params }: { params: Promise<{ id: string }> }) {
  const { ws } = await requireActiveWorkspace();
  if (!atLeast(ws.role, "editor")) redirect(`/app/artigos/${(await params).id}`);
  const { id } = await params;
  const data = await getArticleDetail(ws.id, id);
  if (!data) notFound();
  if (!data.content) redirect(`/app/artigos/${id}`);

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Artigos · Editar" />
      <div className="flex-1 overflow-y-auto p-6">
        <ArticleEditor articleId={id} initial={data.content} />
      </div>
    </>
  );
}
