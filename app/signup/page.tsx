import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <Link href="/" className="mb-10 font-display text-2xl text-ink">
        Rooming House Index
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-8">
        <h1 className="mb-1 text-center font-display text-2xl text-ink">Create your account</h1>
        <p className="mb-8 text-center text-sm text-muted">
          Get suburb-level rooming house data in minutes
        </p>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
