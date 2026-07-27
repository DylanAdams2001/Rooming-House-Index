import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 py-12">
      <Link href="/" className="mb-10 font-display text-2xl text-ink">
        Rooming House Standard
      </Link>
      <div className="w-full max-w-lg rounded-card border border-line bg-white p-8">{children}</div>
    </div>
  );
}
