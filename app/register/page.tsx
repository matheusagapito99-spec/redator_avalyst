import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/app");
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <AuthForm mode="register" action={registerAction} />
    </main>
  );
}
