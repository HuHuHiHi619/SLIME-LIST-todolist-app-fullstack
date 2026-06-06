const { addDays, startOfWeek, addWeeks } = require("date-fns");
const {
  getTaskDeadlineRange,
  isOverdue,
  overdueThreshold,
} = require("../../shared/utils/deadlineUtils");

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

// Regression: P0 #25 — the overdue cron must not fail a task before the day it
// was due has passed in the user's own timezone. The deadline is stored as a raw
// local-instant (P5 #18), so a "due day D" pick lands anywhere within ±14h of UTC
// midnight depending on the user's offset. A 1-day grace (UTC start-of-yesterday)
// guarantees we never fail EARLY in any zone — the harmful direction. All instants
// below are absolute UTC, so these assertions are deterministic on any host TZ.
describe("isOverdue / overdueThreshold (P0 #25 cron TZ safety)", () => {
  it("overdueThreshold is UTC start-of-yesterday relative to now", () => {
    const now = new Date("2026-06-07T13:52:00.000Z");
    expect(overdueThreshold(now).toISOString()).toBe("2026-06-06T00:00:00.000Z");
  });

  // +7 (the dev's zone): "due Jun 7" -> stored 2026-06-06T17:00:00Z
  it("does NOT fail a +7 'due tomorrow' task at the first cron fire", () => {
    const deadline = "2026-06-06T17:00:00.000Z";
    expect(isOverdue(deadline, new Date("2026-06-07T00:00:00.000Z"))).toBe(false);
  });
  it("DOES fail the +7 task one cron cycle later", () => {
    const deadline = "2026-06-06T17:00:00.000Z";
    expect(isOverdue(deadline, new Date("2026-06-08T00:00:00.000Z"))).toBe(true);
  });

  // Extreme east (+14): "due Jun 7" -> stored 2026-06-06T10:00:00Z — still not early
  it("never fails an extreme-east (+14) task early", () => {
    const deadline = "2026-06-06T10:00:00.000Z";
    expect(isOverdue(deadline, new Date("2026-06-07T00:00:00.000Z"))).toBe(false);
    expect(isOverdue(deadline, new Date("2026-06-08T00:00:00.000Z"))).toBe(true);
  });

  // Extreme west (-12): "due Jun 7" -> stored 2026-06-07T12:00:00Z — lands exactly on time
  it("fails an extreme-west (-12) task on the correct cycle, not early", () => {
    const deadline = "2026-06-07T12:00:00.000Z";
    expect(isOverdue(deadline, new Date("2026-06-08T00:00:00.000Z"))).toBe(false);
    expect(isOverdue(deadline, new Date("2026-06-09T00:00:00.000Z"))).toBe(true);
  });
});
