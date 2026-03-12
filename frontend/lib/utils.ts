export const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  } catch (e) {
    return "Invalid date";
  }
};

export const getStatus = (expirationDate: string | null) => {
  if (!expirationDate) return null;
  const now = new Date();
  const exp = new Date(expirationDate);
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Expired", color: "text-rose-600 bg-rose-50 border-rose-100", isExpired: true };
  if (diffDays <= 3) return { label: `Expires in ${diffDays}d`, color: "text-amber-600 bg-amber-50 border-amber-100", isWarning: true };
  return null;
};
