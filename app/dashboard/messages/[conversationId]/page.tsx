import { ConversationView } from "@/components/messages/conversation-view";

export default function DashboardConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  return <ConversationView conversationId={params.conversationId} basePath="/dashboard" />;
}
