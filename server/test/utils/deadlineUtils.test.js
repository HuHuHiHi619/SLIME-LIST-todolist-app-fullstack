const { addDays, startOfWeek, addWeeks } = require("date-fns");
const { getTaskDeadlineRange } = require("../../shared/utils/deadlineUtils");

describe("getTaskDeadlineRange", () => {
  it('returns "today" for today\'s date', () => {
    expect(getTaskDeadlineRange(new Date())).toBe("today");
  });

  it('returns "tomorrow" for tomorrow\'s date', () => {
    expect(getTaskDeadlineRange(addDays(new Date(), 1))).toBe("tomorrow");
  });

  it('returns "nextWeek" for a date in the middle of next week', () => {
    // Monday of next week — always within the next-week interval regardless of today's day
    const nextWeekMonday = addDays(startOfWeek(addWeeks(new Date(), 1)), 1);
    expect(getTaskDeadlineRange(nextWeekMonday)).toBe("nextWeek");
  });

  it('does NOT return "nextMonth" for a date that falls in next week', () => {
    // This is the regression guard: the original bug returned "nextMonth" for next-week dates
    const nextWeekMonday = addDays(startOfWeek(addWeeks(new Date(), 1)), 1);
    expect(getTaskDeadlineRange(nextWeekMonday)).not.toBe("nextMonth");
  });

  it('returns undefined for a date with no matching bucket', () => {
    // A date far in the future (2 years out) falls outside all defined buckets
    expect(getTaskDeadlineRange(addDays(new Date(), 730))).toBeUndefined();
  });
});
