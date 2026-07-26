import { ConversationView } from "@/components/messages/conversation-view";

export default function PartnersConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  return (
    <ConversationView
      conversationId={params.conversationId}
      basePath="/partners"
      perspective="provider"
    />
  );
}
