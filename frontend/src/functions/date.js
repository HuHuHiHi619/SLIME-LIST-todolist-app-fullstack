// Shared date-only serializer for task forms.
// The date pickers emit a Date at LOCAL midnight of the picked day, and read back
// with `new Date(value)` in local time — so storing the raw ISO instant round-trips
// to the same calendar day in the user's own timezone. Keep CreateTask and taskDetail
// on this one helper so the two paths can't diverge (the root cause of P5 #18).
export const toDayISO = (date) =>
  date instanceof Date && !isNaN(date) ? date.toISOString() : null;
