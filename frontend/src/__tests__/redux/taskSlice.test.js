import { describe, it, expect } from "vitest";
import reducer, {
  setStreakStatus,
} from "../../redux/taskSlice";

const init = () => reducer(undefined, { type: "@@INIT" });

describe("taskSlice — initial state", () => {
  it("starts with streakStatus from localStorage (empty object when nothing stored)", () => {
    const state = init();
    expect(state.streakStatus).toEqual({});
  });
});

describe("taskSlice — setStreakStatus", () => {
  it("replaces streakStatus", () => {
    const state = reducer(init(), setStreakStatus({ currentStreak: 5 }));
    expect(state.streakStatus).toEqual({ currentStreak: 5 });
  });
});
