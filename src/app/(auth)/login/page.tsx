import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <LoginForm />
    </main>
  );
}
