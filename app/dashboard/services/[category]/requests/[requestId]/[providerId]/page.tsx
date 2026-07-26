import { getServiceCategory } from "@/lib/service-categories";
import { QuoteConversationView } from "@/components/messages/quote-conversation-view";

export default function InvestorQuoteConversationPage({
  params,
}: {
  params: { category: string; requestId: string; providerId: string };
}) {
  const category = getServiceCategory(params.category);

  return (
    <QuoteConversationView
      requestId={params.requestId}
      providerId={params.providerId}
      backHref={`/dashboard/services/${category?.slug ?? params.category}`}
      perspective="investor"
    />
  );
}
