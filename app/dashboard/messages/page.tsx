import { MessagesInbox } from "@/components/messages/messages-inbox";
import { Hint } from "@/components/hints/hint";

export default function DashboardMessagesPage() {
  return (
    <>
      <Hint hintKey="dashboard-messages" title="Messages">
        <p>Every conversation with a service provider lives here, including quote requests.</p>
        <p>Start a new one from any provider&apos;s profile in Services.</p>
      </Hint>
      <MessagesInbox basePath="/dashboard" />
    </>
  );
}
