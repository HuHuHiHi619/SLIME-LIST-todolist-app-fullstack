/* eslint-disable react/prop-types, react/display-name -- trivial test wrapper */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import { fetchTasks } from "../../redux/taskSlice";
import useFetchTask from "../../components/pages/hooks/useFetchTask";

// The hook only consumes `state.tasks.{tasks,lastStateUpdate}` and dispatches
// `fetchTasks`. Mock the thunk to a spyable plain action and back the store
// with a stub reducer so we test the effect's dep behavior in isolation.
vi.mock("../../redux/taskSlice", () => ({
  fetchTasks: vi.fn(() => ({ type: "task/fetchTasks/stub" })),
}));

function makeWrapper() {
  const store = configureStore({
    reducer: {
      tasks: (state = { tasks: [], lastStateUpdate: null }) => state,
    },
  });
  return ({ children }) => <Provider store={store}>{children}</Provider>;
}

describe("useFetchTask (P3 #16 — refetch stabilization)", () => {
  beforeEach(() => {
    fetchTasks.mockClear();
  });

  it("does not refetch when the parent re-renders with a new-but-equal filter object", () => {
    const { rerender } = renderHook(({ filter }) => useFetchTask(filter), {
      wrapper: makeWrapper(),
      initialProps: { filter: { status: "pending" } },
    });
    expect(fetchTasks).toHaveBeenCalledTimes(1);

    // Fresh inline object literal, identical content — the exact pattern every
    // call site uses (`filter={{ status: "pending" }}`). Must NOT refetch.
    rerender({ filter: { status: "pending" } });
    rerender({ filter: { status: "pending" } });
    expect(fetchTasks).toHaveBeenCalledTimes(1);
  });

  it("refetches when the filter content actually changes", () => {
    const { rerender } = renderHook(({ filter }) => useFetchTask(filter), {
      wrapper: makeWrapper(),
      initialProps: { filter: { status: "pending" } },
    });
    expect(fetchTasks).toHaveBeenCalledTimes(1);

    rerender({ filter: { status: "completed" } });
    expect(fetchTasks).toHaveBeenCalledTimes(2);
  });
});
