export const EXP_BY_PRIORITY  = { high: 50, medium: 25, low: 10 };
export const COIN_BY_PRIORITY = { high: 20, medium: 10, low: 5 };

export const PRIORITY_CONFIG = {
  high:   { dot: "#E2553D", label: "HIGH",   border: "#E2553D" },
  medium: { dot: "#E0A53A", label: "MEDIUM", border: "#E0A53A" },
  low:    { dot: "#2BB795", label: "LOW",    border: "#2BB795" },
};

export function getDeadlineMeta(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diffDays = Math.floor((d - now) / 86_400_000);
  if (diffDays < 0)   return { label: `Overdue ${Math.abs(diffDays)}d`, color: "#E22D38" };
  if (diffDays === 0) return { label: "Today",    color: "#DEA331" };
  if (diffDays === 1) return { label: "Tomorrow", color: "#9999E3" };
  return {
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    color: "#9999E3",
  };
}
