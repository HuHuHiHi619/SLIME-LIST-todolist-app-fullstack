import { describe, it, expect } from "vitest";
import reducer, {
  setFormTask,
  resetFormTask,
  addSteps,
  removeStep,
} from "../../redux/formSlice";

const init = () => reducer(undefined, { type: "@@INIT" });

describe("formSlice — initial state", () => {
  it("starts with blank formTask and empty progress", () => {
    const state = init();
    expect(state.formTask.title).toBe("");
    expect(state.formTask.status).toBe("pending");
    expect(state.formTask.deadline).toBe(null);
    expect(state.progress.steps).toEqual([]);
    expect(state.progress.totalSteps).toBe(0);
    expect(state.progress.allStepsCompleted).toBe(false);
  });
});

describe("formSlice — setFormTask", () => {
  it("merges fields", () => {
    const state = reducer(init(), setFormTask({ title: "Hello", note: "N" }));
    expect(state.formTask.title).toBe("Hello");
    expect(state.formTask.note).toBe("N");
  });

  it("deadline: null clears to null, not epoch 1970", () => {
    const seeded = reducer(init(), setFormTask({ deadline: "2026-05-20" }));
    const cleared = reducer(seeded, setFormTask({ deadline: null }));
    expect(cleared.formTask.deadline).toBe(null);
  });

  it("an invalid deadline does not throw and keeps the prior value", () => {
    const seeded = reducer(init(), setFormTask({ deadline: "2026-05-20" }));
    const prior = seeded.formTask.deadline;
    let next;
    expect(() => {
      next = reducer(seeded, setFormTask({ deadline: "not-a-date" }));
    }).not.toThrow();
    expect(next.formTask.deadline).toBe(prior);
  });
});

describe("formSlice — resetFormTask", () => {
  it("restores defaults", () => {
    const dirty = {
      ...init(),
      formTask: { ...init().formTask, title: "dirty" },
      progress: { ...init().progress, totalSteps: 5 },
    };
    const state = reducer(dirty, resetFormTask());
    expect(state.formTask.title).toBe("");
    expect(state.progress.totalSteps).toBe(0);
    expect(state.progress.steps).toEqual([]);
  });
});

describe("formSlice — addSteps / removeStep", () => {
  it("addSteps appends a step and updates totals", () => {
    const state = reducer(init(), addSteps({ label: "step1", completed: false }));
    expect(state.progress.steps).toHaveLength(1);
    expect(state.progress.totalSteps).toBe(1);
    expect(state.progress.allStepsCompleted).toBe(false);
    expect(state.progress.history.steps).toHaveLength(1);
  });

  it("removeStep deletes by index and decrements totals", () => {
    const seeded = reducer(init(), addSteps({ label: "s1", completed: true }));
    const next = reducer(seeded, removeStep(0));
    expect(next.progress.steps).toHaveLength(0);
    expect(next.progress.totalSteps).toBe(0);
  });
});

