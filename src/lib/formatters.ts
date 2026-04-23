export const formatCurrency = (value?: number | null) => `$${Number(value || 0).toFixed(2)}`;

export const formatDateLabel = (value?: string | null) => {
  if (!value) return "Date not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTimeLabel = (value?: string | null) => value || "Time not set";

export const formatStatusLabel = (value?: string | null) => {
  const raw = String(value || "").trim().toLowerCase();
  const statusMap: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    accepting_delivery: "Accepting Delivery",
    revision_requested: "Request Revision",
    under_revision: "Under Revision",
    after_sell_revision_requested: "After-Sale Revision",
    under_after_sell_revision: "Under After-Sale Revision",
    done_after_sell_revision: "Done After-Sale Revision",
    completed: "Completed",
    declined: "Declined",
    cancelled: "Cancelled",
    open: "Open",
  };

  if (statusMap[raw]) return statusMap[raw];

  const normalized = raw.replace(/_/g, " ").trim();

  if (!normalized) return "Unknown";
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getInitials = (name?: string | null) => {
  const parts = String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "NA";
};
