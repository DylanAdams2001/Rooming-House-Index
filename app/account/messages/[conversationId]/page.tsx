import { ListingConversationView } from "@/components/messages/listing-conversation-view";

export default function AccountConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  return <ListingConversationView conversationId={params.conversationId} />;
}
