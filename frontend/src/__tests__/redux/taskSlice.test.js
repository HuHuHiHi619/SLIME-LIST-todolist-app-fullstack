import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { streakMiddleware } from "../../redux/store";
import reducer, {
  setCategories,
  clearTask,
  clearTaskError,
  clearSearchResults,
  fetchTasks,
  fetchSearchTasks,
  fetchCategories,
  createNewTask,
  updatedTask,
  completedTask,
  removedTask,
  removedAllTask,
  removedCategory,
} from "../../redux/taskSlice";

const init = () => reducer(undefined, { type: "@@INIT" });

describe("taskSlice — initial state", () => {
  it("has empty collections and no error", () => {
    const state = init();
    expect(state.tasks).toEqual([]);
    expect(state.searchResults).toEqual([]);
    expect(state.categories).toEqual([]);
    expect(state.error).toBe(null);
    expect(state.isSummaryUpdated).toBe(false);
  });
});

describe("taskSlice — categories", () => {
  it("setCategories replaces the list", () => {
    const cats = [{ _id: "c1", categoryName: "Work" }];
    expect(reducer(init(), setCategories(cats)).categories).toEqual(cats);
  });
  it("removedCategory.fulfilled removes the category whose _id matches meta.arg", () => {
    const state = {
      ...init(),
      categories: [{ _id: "c1" }, { _id: "c2" }],
    };
    const next = reducer(state, {
      type: removedCategory.fulfilled.type,
      meta: { arg: "c1" },
    });
    expect(next.categories).toEqual([{ _id: "c2" }]);
  });

  it("removedCategory.rejected sets error and leaves categories untouched (no contradiction)", () => {
    const state = {
      ...init(),
      categories: [{ _id: "c1" }, { _id: "c2" }],
    };
    const next = reducer(state, {
      type: removedCategory.rejected.type,
      error: { message: "boom" },
    });
    expect(next.categories).toEqual([{ _id: "c1" }, { _id: "c2" }]);
    expect(next.error).toBe("boom");
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
  it("fetchTasks.fulfilled stores tasks", () => {
    const tasks = [{ _id: "a", status: "pending" }];
    const state = reducer(init(), { type: fetchTasks.fulfilled.type, payload: tasks });
    expect(state.tasks).toEqual(tasks);
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
  it("fetchCategories.rejected records error from payload", () => {
    const state = reducer(
      init(),
      { type: fetchCategories.rejected.type, payload: "boom" }
    );
    expect(state.error).toBe("boom");
  });
  it("fetchTasks.rejected resets tasks and records error from payload", () => {
    const state = reducer(
      { ...init(), tasks: [{ _id: "a" }] },
      { type: fetchTasks.rejected.type, payload: "down" }
    );
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

describe("taskSlice — mutation error surface (#21 / P4 #2)", () => {
  it("updatedTask.rejected records error from rejectWithValue payload", () => {
    const state = reducer(init(), {
      type: updatedTask.rejected.type,
      payload: "save failed",
      error: { message: "Rejected" },
    });
    expect(state.error).toBe("save failed");
  });
  it("falls back to error.message when there is no payload (uncaught throw)", () => {
    const state = reducer(init(), {
      type: completedTask.rejected.type,
      error: { message: "Network Error" },
    });
    expect(state.error).toBe("Network Error");
  });
  it("falls back to a generic message when neither is present", () => {
    const state = reducer(init(), { type: removedTask.rejected.type });
    expect(state.error).toBe("Something went wrong");
  });
  it("pending clears a prior error so an identical repeat failure re-fires", () => {
    const failed = reducer(init(), {
      type: removedAllTask.rejected.type,
      payload: "boom",
    });
    expect(failed.error).toBe("boom");
    const retrying = reducer(failed, { type: removedAllTask.pending.type });
    expect(retrying.error).toBe(null);
  });
  it("clearTaskError resets error to null", () => {
    const state = reducer({ ...init(), error: "x" }, clearTaskError());
    expect(state.error).toBe(null);
  });
});

describe("streakMiddleware — localStorage persistence", () => {
  const makeStore = () =>
    configureStore({
      reducer: { tasks: reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(streakMiddleware),
    });

  beforeEach(() => localStorage.clear());

  it("writes streakStatus to localStorage when completedTask.fulfilled carries user", () => {
    const store = makeStore();
    store.dispatch({
      type: completedTask.fulfilled.type,
      payload: { _id: "a", user: { currentStreak: 5 } },
    });
    expect(JSON.parse(localStorage.getItem("streakStatus"))).toEqual({
      currentStreak: 5,
    });
  });

  it("does not write to localStorage when completedTask.fulfilled has no user", () => {
    const store = makeStore();
    store.dispatch({
      type: completedTask.fulfilled.type,
      payload: { _id: "a", updatedTask: { status: "completed" } },
    });
    expect(localStorage.getItem("streakStatus")).toBeNull();
  });
});
