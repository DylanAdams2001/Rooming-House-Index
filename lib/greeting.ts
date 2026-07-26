// Best-effort friendly first name for email greetings — falls back to the
// part before the @ in their email address if no full_name is on file.
export function firstNameOf(fullName: string | null | undefined, email: string): string {
  if (fullName?.trim()) return fullName.trim().split(/\s+/)[0];
  return email.split("@")[0];
}
