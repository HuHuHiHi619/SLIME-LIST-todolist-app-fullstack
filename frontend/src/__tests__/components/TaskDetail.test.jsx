/* eslint-disable react/prop-types, react/display-name */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Stub all child UI components — we only care about the effect / state behaviour
vi.mock("../../components/pages/ui/inputField", () => ({
  default: ({ value, onChange, name }) => (
    <input data-testid={`input-${name}`} value={value} onChange={onChange} />
  ),
}));
vi.mock("../../components/pages/ui/StartDatePicker", () => ({ default: () => null }));
vi.mock("../../components/pages/ui/DeadlinePicker",  () => ({ default: () => null }));
vi.mock("../../components/pages/ui/ProgressField",   () => ({ default: () => null }));
vi.mock("../../components/pages/ui/CategoryTagField",() => ({ default: () => null }));
vi.mock("../../components/pages/ui/PriorityField",   () => ({ default: () => null }));
vi.mock("../../components/pages/animation/FadeUpContainer", () => ({
  default: ({ children }) => <>{children}</>,
}));

// Stub lodash debounce → no-op so the async save path never fires
vi.mock("lodash", () => ({
  debounce: () => {
    const fn = vi.fn();
    fn.flush = vi.fn();
    return fn;
  },
}));

import TaskDetail from "../../components/pages/ui/taskDetail";

const SET_SELECTED = "TEST/setSelectedTask";

function makeStore(initialTask) {
  return configureStore({
    reducer: {
      tasks: (
        state = { selectedTask: initialTask, categories: [] },
        action
      ) => {
        if (action.type === SET_SELECTED) {
          return { ...state, selectedTask: action.payload };
        }
        return state;
      },
    },
  });
}

describe("TaskDetail — BL #17 stale-closure regression", () => {
  it("does NOT reset editedTask when selectedTask content changes with the same _id", () => {
    const store = makeStore({ _id: "task-1", title: "Original", note: "" });

    render(
      <Provider store={store}>
        <TaskDetail onClose={() => {}} />
      </Provider>
    );

    expect(screen.getByTestId("input-title").value).toBe("Original");

    // User edits the title locally
    fireEvent.change(screen.getByTestId("input-title"), {
      target: { name: "title", value: "User edited" },
    });
    expect(screen.getByTestId("input-title").value).toBe("User edited");

    // Simulate updatedTask.fulfilled writing server response back into selectedTask
    // (same _id, content differs — the exact scenario that caused the stale-closure clobber)
    act(() => {
      store.dispatch({ type: SET_SELECTED, payload: { _id: "task-1", title: "From server", note: "" } });
    });

    // Fix: dep is selectedTask?._id — same ID means effect does not fire → local edit preserved
    expect(screen.getByTestId("input-title").value).toBe("User edited");
  });

  it("DOES reset editedTask when a different task is opened (ID changes)", () => {
    const store = makeStore({ _id: "task-1", title: "Task one", note: "" });

    render(
      <Provider store={store}>
        <TaskDetail onClose={() => {}} />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("input-title"), {
      target: { name: "title", value: "User edited" },
    });

    act(() => {
      store.dispatch({ type: SET_SELECTED, payload: { _id: "task-2", title: "Task two", note: "" } });
    });

    // ID changed → effect fires → reset to new task
    expect(screen.getByTestId("input-title").value).toBe("Task two");
  });
});
