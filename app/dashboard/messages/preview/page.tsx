import Link from "next/link";
import { ChatThreadDemo } from "@/components/chat/chat-thread-demo";
import { ArrowLeft } from "lucide-react";

export default function MessagesPreviewPage({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link
        href="/dashboard/services"
        className="mb-4 flex items-center gap-2 text-sm text-body hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Link>
      <ChatThreadDemo otherPartyName={searchParams.name ?? "Provider"} />
    </div>
  );
}
