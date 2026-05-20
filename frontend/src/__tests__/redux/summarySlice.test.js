import { describe, it, expect } from "vitest";
import reducer, {
  fetchSummary,
  fetchSummaryByCategory,
  clearSummaryState,
  toggleInstructPopup,
} from "../../redux/summarySlice";

const init = () => reducer(undefined, { type: "@@INIT" });

describe("summarySlice — initial state", () => {
  it("starts empty with instruction closed", () => {
    const state = init();
    expect(state.summary).toEqual([]);
    expect(state.summaryCategory).toEqual([]);
    expect(state.notification).toEqual([]);
    expect(state.instruction).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });
});

describe("summarySlice — sync reducers", () => {
  it("toggleInstructPopup flips instruction", () => {
    const state = reducer(init(), toggleInstructPopup());
    expect(state.instruction).toBe(true);
  });

  it("clearSummaryState resets collections and flags", () => {
    const dirty = {
      summary: [1],
      summaryCategory: [2],
      notification: [3],
      loading: true,
      error: "x",
      instruction: true,
    };
    const state = reducer(dirty, clearSummaryState());
    expect(state.summary).toEqual([]);
    expect(state.summaryCategory).toEqual([]);
    expect(state.notification).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });
});

describe("summarySlice — async lifecycle", () => {
  it("fetchSummary.pending sets loading", () => {
    const state = reducer(init(), { type: fetchSummary.pending.type });
    expect(state.loading).toBe(true);
  });

  it("fetchSummary.fulfilled stores payload and clears loading", () => {
    const payload = [{ category: "A", rate: 50 }];
    const state = reducer(init(), {
      type: fetchSummary.fulfilled.type,
      payload,
    });
    expect(state.summary).toEqual(payload);
    expect(state.loading).toBe(false);
  });

  it("fetchSummary.rejected clears loading, resets summary, records error from payload", () => {
    const state = reducer(
      { ...init(), loading: true, summary: [1] },
      { type: fetchSummary.rejected.type, payload: "boom" }
    );
    expect(state.loading).toBe(false);
    expect(state.summary).toEqual([]);
    expect(state.error).toBe("boom");
  });

  it("fetchSummaryByCategory.fulfilled stores payload", () => {
    const payload = [{ categoryName: "Work", rate: 75 }];
    const state = reducer(init(), {
      type: fetchSummaryByCategory.fulfilled.type,
      payload,
    });
    expect(state.summaryCategory).toEqual(payload);
    expect(state.loading).toBe(false);
  });
});
