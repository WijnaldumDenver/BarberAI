import { Navbar } from "@/components/layout/Navbar";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
