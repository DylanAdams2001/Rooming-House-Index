import { MessagesInbox } from "@/components/messages/messages-inbox";
import { Hint } from "@/components/hints/hint";

export default function PartnersMessagesPage() {
  return (
    <>
      <Hint hintKey="partners-messages" title="Messages">
        <p>
          Every conversation with a member lives here — direct messages, quote requests, and
          (for property managers) tenant room enquiries, all merged into one inbox.
        </p>
      </Hint>
      <MessagesInbox basePath="/partners" perspective="provider" />
    </>
  );
}
