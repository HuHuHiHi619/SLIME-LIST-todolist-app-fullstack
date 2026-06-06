const {
  startOfDay,
  addDays,
  startOfWeek,
  addWeeks,
  endOfWeek,
  isSameDay,
  isSameMonth,
  addMonths,
  isWithinInterval,
} = require("date-fns");

/**
 * Classifies a task deadline into a named time bucket relative to today.
 * Returns: "today" | "tomorrow" | "thisWeek" | "nextWeek" | "thisMonth" | "nextMonth" | undefined
 *
 * Note: the thisMonth/nextMonth branches have a known pre-existing bug —
 * both check addMonths(currentDate, 1) instead of currentDate for "thisMonth".
 * Preserved verbatim; tracked in server/CLAUDE.md Known Issues.
 */
const getTaskDeadlineRange = (deadline) => {
  const taskDeadline = startOfDay(new Date(deadline));
  const currentDate = startOfDay(new Date());

  if (isSameDay(taskDeadline, currentDate)) return "today";

  if (isSameDay(taskDeadline, addDays(currentDate, 1))) return "tomorrow";

  const isThisWeek = isWithinInterval(taskDeadline, {
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate),
  });
  if (isThisWeek) return "thisWeek";

  const isNextWeek = isWithinInterval(taskDeadline, {
    start: startOfWeek(addWeeks(currentDate, 1)),
    end: endOfWeek(addWeeks(currentDate, 1)),
  });
  if (isNextWeek) return "nextWeek"; // was "nextMonth" in original — label bug fixed

  const isThisMonth = isSameMonth(taskDeadline, addMonths(currentDate, 1));
  if (isThisMonth) return "thisMonth";

  const isNextMonth = isSameMonth(taskDeadline, addMonths(currentDate, 1));
  if (isNextMonth) return "nextMonth";
};

/**
 * Overdue threshold for the daily cron (P0 #25).
 *
 * Deadlines are stored as a raw local-instant (P5 #18 frontend convention), so a
 * task the user set for "day D" lands at local-midnight(D) — anywhere within ±14h
 * of UTC midnight depending on their timezone offset. The server has no per-user
 * timezone, so it cannot recover which calendar day was meant from the bare instant.
 *
 * We therefore grace the comparison by one full day, anchored to UTC start-of-day
 * (explicit UTC, not date-fns startOfDay, so behaviour is identical wherever the
 * cron is deployed). 24h grace > the 14h max TZ skew, which guarantees we never
 * mark a task failed BEFORE its due day has ended in any timezone — the only
 * user-harmful direction. The cost is that some zones see a task linger as
 * not-failed up to ~one extra cron cycle, which is benign for gamification.
 */
const overdueThreshold = (now = new Date()) => {
  const t = new Date(now);
  t.setUTCHours(0, 0, 0, 0);
  t.setUTCDate(t.getUTCDate() - 1);
  return t;
};

const isOverdue = (deadline, now = new Date()) =>
  new Date(deadline) < overdueThreshold(now);

module.exports = { getTaskDeadlineRange, overdueThreshold, isOverdue };
