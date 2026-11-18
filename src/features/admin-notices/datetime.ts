/** Wireframe datetime helpers: display `YYYY.MM.DD HH:mm`, inputs use native date/time. */

export function splitDisplayDateTime(value: string | null | undefined) {
  if (!value) return { date: "", time: "" };
  const [datePart = "", timePart = ""] = value.trim().split(/\s+/);
  return {
    date: datePart.includes(".") ? datePart.replace(/\./g, "-") : datePart,
    time: timePart.slice(0, 5),
  };
}

export function joinDisplayDateTime(date: string, time: string) {
  const trimmedDate = date.trim();
  const trimmedTime = time.trim();
  if (!trimmedDate) return null;
  const displayDate = trimmedDate.includes("-") ? trimmedDate.replace(/-/g, ".") : trimmedDate;
  if (!trimmedTime) return displayDate;
  return `${displayDate} ${trimmedTime.slice(0, 5)}`;
}

export function todayDisplayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}
