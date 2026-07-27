import { ListingMessagesInbox } from "@/components/messages/listing-messages-inbox";
import { Hint } from "@/components/hints/hint";

export default function AccountMessagesPage() {
  return (
    <>
      <Hint hintKey="account-messages" title="Messages">
        <p>Every conversation with a property team lives here, once you&apos;ve enquired on a room.</p>
        <p>Reply here to ask questions, confirm an inspection, or reschedule.</p>
      </Hint>
      <ListingMessagesInbox />
    </>
  );
}
