import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <OnboardingForm />
    </main>
  );
}
