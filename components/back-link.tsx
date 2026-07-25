import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
