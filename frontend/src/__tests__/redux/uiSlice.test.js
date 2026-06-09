import { describe, it, expect } from "vitest";
import reducer, {
  toggleCreatePopup,
  setActiveMenu,
  togglePopup,
  setHover,
  toggleSidebarPinned,
  setSelectedTask,
  setTaskError,
  clearTaskError,
} from "../../redux/uiSlice";

const init = () => reducer(undefined, { type: "@@INIT" });

describe("uiSlice — initial state", () => {
  it("starts with all popups closed and no selection", () => {
    const state = init();
    expect(state.isCreate).toBe(false);
    expect(state.isTaskDetail).toBe(false);
    expect(state.isPopup).toBe(false);
    expect(state.popupMode).toBe("");
    expect(state.isHover).toBe(null);
    expect(state.isSidebarPinned).toBe(false);
    expect(state.activeMenu).toBe("");
    expect(state.selectedTask).toBe(null);
    expect(state.taskError).toBe(null);
  });
});

describe("uiSlice — UI toggles", () => {
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

  it("togglePopup with no arg sets popupMode to empty string", () => {
    const open = reducer(init(), togglePopup("delete"));
    const closed = reducer(open, togglePopup(""));
    expect(closed.isPopup).toBe(false);
    expect(closed.popupMode).toBe("");
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

describe("uiSlice — taskError", () => {
  it("setTaskError stores the message", () => {
    const state = reducer(init(), setTaskError("network error"));
    expect(state.taskError).toBe("network error");
  });

  it("clearTaskError resets to null", () => {
    const errored = reducer(init(), setTaskError("boom"));
    expect(reducer(errored, clearTaskError()).taskError).toBe(null);
  });
});
