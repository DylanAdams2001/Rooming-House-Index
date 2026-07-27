import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; ref?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <Link href="/" className="mb-10 font-display text-2xl text-ink">
        Rooming House Index
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-8">
        <h1 className="mb-1 text-center font-display text-2xl text-ink">Create your account</h1>
        <p className="mb-8 text-center text-sm text-muted">
          One profile for enquiring about rooms — investor data is an optional add-on once you're in.
        </p>
        <AuthForm mode="signup" redirectTo={searchParams.redirectTo} referralCode={searchParams.ref} />
      </div>
    </div>
  );
}
