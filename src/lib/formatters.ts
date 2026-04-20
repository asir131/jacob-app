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
  const normalized = String(value || "")
    .replace(/_/g, " ")
    .trim();

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
