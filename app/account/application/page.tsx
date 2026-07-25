import { ApplicationForm } from "@/components/account/application-form";

export default function ApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-ink">My Application</h1>
      <p className="mt-2 text-body">
        The details a landlord sees when you enquire about a room. Update this any time.
      </p>
      <div className="mt-8">
        <ApplicationForm />
      </div>
    </div>
  );
}
