import { SuburbExplorer } from "./suburb-explorer";
import { Hint } from "@/components/hints/hint";

export default function SuburbsPage() {
  return (
    <>
      <Hint hintKey="dashboard-suburbs" title="Suburb Explorer" image="/hints/dashboard-suburbs.jpg">
        <p>Search and filter every tracked suburb on a map — by yield, demand, or room rate.</p>
        <p>Click into any suburb for its full stats, or save it for quick comparison later.</p>
      </Hint>
      <SuburbExplorer />
    </>
  );
}
