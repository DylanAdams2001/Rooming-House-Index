import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <Link href="/" className="mb-10 font-display text-2xl text-ink">
        Rooming House Standard
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-8">
        <h1 className="mb-1 text-center font-display text-2xl text-ink">Welcome back</h1>
        <p className="mb-8 text-center text-sm text-muted">
          Log in to access your dashboard
        </p>
        <AuthForm mode="login" redirectTo={searchParams.redirectTo} />
      </div>
    </div>
  );
}
