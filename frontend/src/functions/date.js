// Shared date-only serializer for task forms.
// Normalizes to UTC midnight so the calendar date is the same regardless of the
// user's timezone — avoids "today" being rejected by the server when the user is
// east of UTC and local midnight precedes UTC midnight.
export const toDayISO = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return null;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
};
