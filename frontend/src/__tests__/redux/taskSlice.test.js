import { describe, it, expect } from "vitest";
import reducer, {
  setActiveMenu,
  setHover,
  togglePopup,
  toggleCreatePopup,
  toggleSidebarPinned,
  setCategories,
  removeCategories,
  setSelectedTask,
  setFormTask,
  resetFormTask,
  clearTask,
  clearSearchResults,
  addSteps,
  removeStep,
  fetchTasks,
  fetchSearchTasks,
  fetchCategories,
  createNewTask,
  updatedTask,
  completedTask,
  removedTask,
  removedAllTask,
} from "../../redux/taskSlice";

const init = () => reducer(undefined, { type: "@@INIT" });

describe("taskSlice — initial state", () => {
  it("has empty collections and closed UI", () => {
    const state = init();
    expect(state.tasks).toEqual([]);
    expect(state.searchResults).toEqual([]);
    expect(state.categories).toEqual([]);
    expect(state.isCreate).toBe(false);
    expect(state.isPopup).toBe(false);
    expect(state.isSidebarPinned).toBe(false);
    expect(state.selectedTask).toBe(null);
    expect(state.formTask.status).toBe("pending");
    expect(state.progress.totalSteps).toBe(0);
  });
});

describe("taskSlice — UI toggles", () => {
  it("setActiveMenu stores the menu name", () => {
    expect(reducer(init(), setActiveMenu("home")).activeMenu).toBe("home");
  });
  it("setHover stores the hovered id", () => {
    expect(reducer(init(), setHover("t1")).isHover).toBe("t1");
  });
  it("toggleCreatePopup flips isCreate", () => {
    expect(reducer(init(), toggleCreatePopup()).isCreate).toBe(true);
  });
  it("togglePopup flips isPopup and records mode", () => {
    const state = reducer(init(), togglePopup("delete"));
    expect(state.isPopup).toBe(true);
    expect(state.popupMode).toBe("delete");
  });
  it("toggleSidebarPinned flips the flag", () => {
    expect(reducer(init(), toggleSidebarPinned()).isSidebarPinned).toBe(true);
  });
  it("setSelectedTask stores the selected task and opens detail", () => {
    const task = { _id: "a", title: "X" };
    const state = reducer(init(), setSelectedTask(task));
    expect(state.selectedTask).toEqual(task);
    expect(state.isTaskDetail).toBe(true);
  });
  it("setSelectedTask(null) clears the task and closes detail", () => {
    const open = { ...init(), selectedTask: { _id: "a" }, isTaskDetail: true };
    const state = reducer(open, setSelectedTask(null));
    expect(state.selectedTask).toBe(null);
    expect(state.isTaskDetail).toBe(false);
  });
  it("selecting a second task keeps detail open (no toggle bug)", () => {
    const open = reducer(init(), setSelectedTask({ _id: "a" }));
    const next = reducer(open, setSelectedTask({ _id: "b" }));
    expect(next.selectedTask._id).toBe("b");
    expect(next.isTaskDetail).toBe(true);
  });
});

describe("taskSlice — categories", () => {
  it("setCategories replaces the list", () => {
    const cats = [{ _id: "c1", categoryName: "Work" }];
    expect(reducer(init(), setCategories(cats)).categories).toEqual(cats);
  });
  it("removeCategories filters out the given id", () => {
    const state = {
      ...init(),
      categories: [{ _id: "c1" }, { _id: "c2" }],
    };
    const next = reducer(state, removeCategories("c1"));
    expect(next.categories).toEqual([{ _id: "c2" }]);
  });
});

describe("taskSlice — form & progress", () => {
  it("setFormTask merges fields", () => {
    const state = reducer(init(), setFormTask({ title: "Hello", note: "N" }));
    expect(state.formTask.title).toBe("Hello");
    expect(state.formTask.note).toBe("N");
  });
  it("setFormTask converts startDate to ISO", () => {
    const state = reducer(init(), setFormTask({ startDate: "2026-05-20" }));
    expect(typeof state.formTask.startDate).toBe("string");
    expect(state.formTask.startDate).toContain("2026-05-20");
  });
  it("setFormTask(deadline: null) clears to null, not epoch 1970", () => {
    const seeded = reducer(init(), setFormTask({ deadline: "2026-05-20" }));
    const cleared = reducer(seeded, setFormTask({ deadline: null }));
    expect(cleared.formTask.deadline).toBe(null);
  });
  it("setFormTask with an invalid date does not throw and keeps the prior value", () => {
    const seeded = reducer(init(), setFormTask({ startDate: "2026-05-20" }));
    const prior = seeded.formTask.startDate;
    let next;
    expect(() => {
      next = reducer(seeded, setFormTask({ startDate: "not-a-date" }));
    }).not.toThrow();
    expect(next.formTask.startDate).toBe(prior);
  });
  it("resetFormTask restores defaults", () => {
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

describe("taskSlice — clear reducers", () => {
  it("clearTask empties tasks", () => {
    const state = { ...init(), tasks: [{ _id: "a" }] };
    expect(reducer(state, clearTask()).tasks).toEqual([]);
  });
  it("clearSearchResults empties searchResults", () => {
    const state = { ...init(), searchResults: [{ _id: "a" }] };
    expect(reducer(state, clearSearchResults()).searchResults).toEqual([]);
  });
});

describe("taskSlice — async read lifecycle", () => {
  it("fetchTasks.pending sets loading", () => {
    expect(reducer(init(), { type: fetchTasks.pending.type }).loading).toBe(true);
  });
  it("fetchTasks.fulfilled stores tasks and clears loading", () => {
    const tasks = [{ _id: "a", status: "pending" }];
    const state = reducer(init(), { type: fetchTasks.fulfilled.type, payload: tasks });
    expect(state.tasks).toEqual(tasks);
    expect(state.loading).toBe(false);
  });
  it("fetchSearchTasks.fulfilled stores searchResults", () => {
    const results = [{ _id: "b" }];
    const state = reducer(init(), {
      type: fetchSearchTasks.fulfilled.type,
      payload: results,
    });
    expect(state.searchResults).toEqual(results);
  });
  it("fetchCategories.fulfilled stores categories", () => {
    const cats = [{ _id: "c1" }];
    const state = reducer(init(), { type: fetchCategories.fulfilled.type, payload: cats });
    expect(state.categories).toEqual(cats);
  });
  it("fetchCategories.rejected clears loading and records error from payload", () => {
    const state = reducer(
      { ...init(), loading: true },
      { type: fetchCategories.rejected.type, payload: "boom" }
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe("boom");
  });
  it("fetchTasks.rejected clears loading, resets tasks, records error from payload", () => {
    const state = reducer(
      { ...init(), loading: true, tasks: [{ _id: "a" }] },
      { type: fetchTasks.rejected.type, payload: "down" }
    );
    expect(state.loading).toBe(false);
    expect(state.tasks).toEqual([]);
    expect(state.error).toBe("down");
  });
});

describe("taskSlice — async write lifecycle", () => {
  it("createNewTask.fulfilled appends task and toggles summary flag", () => {
    const before = init();
    const state = reducer(before, {
      type: createNewTask.fulfilled.type,
      payload: { _id: "new", title: "T" },
    });
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0]._id).toBe("new");
    expect(state.isSummaryUpdated).toBe(!before.isSummaryUpdated);
  });

  it("updatedTask.fulfilled merges the matching task", () => {
    const state = {
      ...init(),
      tasks: [{ _id: "a", title: "old" }],
    };
    const next = reducer(state, {
      type: updatedTask.fulfilled.type,
      payload: { _id: "a", title: "new", category: "c", deadline: "d" },
    });
    expect(next.tasks[0].title).toBe("new");
  });

  it("completedTask.fulfilled updates task and persists streak", () => {
    const state = {
      ...init(),
      tasks: [{ _id: "a", status: "pending" }],
    };
    const next = reducer(state, {
      type: completedTask.fulfilled.type,
      payload: { _id: "a", status: "completed", user: { currentStreak: 3 } },
    });
    expect(next.tasks[0].status).toBe("completed");
    expect(next.streakStatus).toEqual({ currentStreak: 3 });
    expect(next.isSummaryUpdated).toBe(true);
  });

  it("removedTask.fulfilled removes the task and toggles summary flag", () => {
    const state = {
      ...init(),
      tasks: [{ _id: "a" }, { _id: "b" }],
      isSummaryUpdated: false,
    };
    const next = reducer(state, {
      type: removedTask.fulfilled.type,
      payload: { _id: "a" },
    });
    expect(next.tasks).toEqual([{ _id: "b" }]);
    expect(next.isSummaryUpdated).toBe(true);
  });

  it("removedAllTask.fulfilled drops completed tasks and toggles summary flag", () => {
    const state = {
      ...init(),
      tasks: [
        { _id: "a", status: "completed" },
        { _id: "b", status: "pending" },
      ],
      isSummaryUpdated: false,
    };
    const next = reducer(state, { type: removedAllTask.fulfilled.type });
    expect(next.tasks).toEqual([{ _id: "b", status: "pending" }]);
    expect(next.isSummaryUpdated).toBe(true);
  });

  it("createNewTask.rejected records error from payload", () => {
    const state = reducer(init(), {
      type: createNewTask.rejected.type,
      payload: "create failed",
    });
    expect(state.error).toBe("create failed");
  });
});
