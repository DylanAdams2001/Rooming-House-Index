import { Badge } from "@/components/ui/badge";
import type { DemandLevel } from "@/lib/mock-data";

const variantMap: Record<DemandLevel, "high" | "medium" | "low"> = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

export function DemandBadge({ level }: { level: DemandLevel }) {
  return <Badge variant={variantMap[level]}>{level} Demand</Badge>;
}
