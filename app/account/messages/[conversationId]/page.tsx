import { ConversationView } from "@/components/messages/conversation-view";

export default function AccountConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  return <ConversationView conversationId={params.conversationId} basePath="/account" />;
}
