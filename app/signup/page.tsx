import { Navbar } from "@/components/layout/Navbar";
import { AuthForm } from "@/components/auth/AuthForm";
import type { UserRole } from "@/lib/types";

interface SignupPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const defaultRole: UserRole = params.role === "barber" ? "barber" : "client";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthForm mode="signup" defaultRole={defaultRole} />
      </main>
    </div>
  );
}
