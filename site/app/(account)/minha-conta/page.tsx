import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SimplePage } from "@/frontend/components/brand/simple-page";
import { SignOutButton } from "@/frontend/components/account/sign-out-button";
import { authOptions } from "@/backend/lib/auth";

export default async function MinhaContaPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SimplePage eyebrow="Conta" title="Minha conta">
      <div className="space-y-4 text-center">
        {session.user?.name && <p className="font-medium">{session.user.name}</p>}
        <p className="text-sm text-ink/60">{session.user?.email}</p>
        <SignOutButton />
      </div>
    </SimplePage>
  );
}
