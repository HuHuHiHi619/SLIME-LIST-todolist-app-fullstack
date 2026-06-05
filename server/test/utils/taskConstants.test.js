const {
  PRIORITIES,
  PRIORITY_ORDER,
} = require("../../shared/utils/taskConstants");

describe("task priority constants", () => {
  it("PRIORITY_ORDER and PRIORITIES use the same lowercase values", () => {
    // Regression guard: the original bug had PRIORITY_ORDER = ["High","Medium","Low"]
    // (capitalised) while the enum was lowercase, so indexOf never matched and sort was dead.
    expect([...PRIORITY_ORDER].sort()).toEqual([...PRIORITIES].sort());
  });

  it("PRIORITY_ORDER sorts highest priority first", () => {
    expect(PRIORITY_ORDER.indexOf("high")).toBeLessThan(
      PRIORITY_ORDER.indexOf("medium")
    );
    expect(PRIORITY_ORDER.indexOf("medium")).toBeLessThan(
      PRIORITY_ORDER.indexOf("low")
    );
  });

  it("every priority value is lowercase", () => {
    PRIORITIES.forEach((p) => expect(p).toBe(p.toLowerCase()));
  });
});
