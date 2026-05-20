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

module.exports = { getTaskDeadlineRange };
