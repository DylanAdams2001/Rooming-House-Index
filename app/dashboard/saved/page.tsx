import { SavedSuburbs } from "./saved-suburbs";
import { Hint } from "@/components/hints/hint";

export default function SavedSuburbsPage() {
  return (
    <>
      <Hint hintKey="dashboard-saved" title="Saved Suburbs">
        <p>Suburbs you&apos;ve bookmarked while exploring — click the save icon on any suburb card to add one.</p>
        <p>Handy for quickly comparing your shortlist without re-searching every time.</p>
      </Hint>
      <SavedSuburbs />
    </>
  );
}
