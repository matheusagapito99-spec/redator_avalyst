import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/shell/sidebar";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveWorkspace } from "@/lib/data/workspaces";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const store = await cookies();
  const preferred = store.get("active_ws")?.value;
  const { list, active } = await getActiveWorkspace(user!.id, preferred);
  if (!active) redirect("/onboarding");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={active} workspaces={list} userName={user!.name} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
