import { QuoteConversationView } from "@/components/messages/quote-conversation-view";

export default function DashboardQuoteMessagesConversationPage({
  params,
}: {
  params: { requestId: string; providerId: string };
}) {
  return (
    <QuoteConversationView
      requestId={params.requestId}
      providerId={params.providerId}
      backHref="/dashboard/messages"
      perspective="investor"
      section="messages"
    />
  );
}
