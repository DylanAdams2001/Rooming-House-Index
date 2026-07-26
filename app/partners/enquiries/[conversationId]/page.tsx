import { ListingConversationView } from "@/components/messages/listing-conversation-view";

export default function PartnersEnquiryConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  return (
    <ListingConversationView
      conversationId={params.conversationId}
      basePath="/partners"
      perspective="manager"
    />
  );
}
