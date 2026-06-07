/* eslint-disable react/prop-types */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useDispatch: vi.fn(), useSelector: vi.fn() };
});

vi.mock("../../components/pages/ui/inputField", () => ({
  default: ({ value, onChange, name, onKeyDown }) => (
    <input
      data-testid={`input-${name}`}
      value={value ?? ""}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  ),
}));
vi.mock("../../components/pages/ui/StartDatePicker",   () => ({ default: () => null }));
vi.mock("../../components/pages/ui/DeadlinePicker",    () => ({ default: () => null }));
vi.mock("../../components/pages/ui/ProgressField",     () => ({ default: () => null }));
vi.mock("../../components/pages/ui/CategoryTagField",  () => ({ default: () => null }));
vi.mock("../../components/pages/ui/PriorityField",     () => ({ default: () => null }));
vi.mock("../../components/pages/ui/Tooltip",           () => ({ default: ({ children }) => <>{children}</> }));
vi.mock("../../components/pages/animation/FadeUpContainer", () => ({
  default: ({ children }) => <>{children}</>,
}));
vi.mock("@fortawesome/react-fontawesome", () => ({ FontAwesomeIcon: () => null }));
vi.mock("@fortawesome/free-solid-svg-icons", () => ({ faXmark: "faXmark" }));
vi.mock("react-datepicker/dist/react-datepicker.css", () => ({}));

vi.mock("../../redux/taskSlice", () => ({
  setFormTask:     vi.fn((p) => ({ type: "tasks/setFormTask", payload: p })),
  addSteps:        vi.fn((p) => ({ type: "tasks/addSteps", payload: p })),
  removeStep:      vi.fn((p) => ({ type: "tasks/removeStep", payload: p })),
  fetchCategories: vi.fn(() => ({ type: "tasks/fetchCategories" })),
  createNewTask:   vi.fn((data) => ({ type: "tasks/createNewTask", payload: data })),
}));

vi.mock("../../redux/summarySlice", () => ({
  fetchSummary:           vi.fn(() => ({ type: "summary/fetchSummary" })),
  fetchSummaryByCategory: vi.fn(() => ({ type: "summary/fetchSummaryByCategory" })),
}));

import CreateTask from "../../components/pages/create/CreateTask";
import { createNewTask } from "../../redux/taskSlice";
import { useDispatch, useSelector } from "react-redux";

const baseFormTask = {
  title: "Test task",
  note: "",
  startDate: "",
  deadline: null,
  category: "",
  priority: "low",
  status: "pending",
};

const baseSelector = {
  formTask: { ...baseFormTask },
  progress: { steps: [], totalSteps: 0, completedSteps: 0 },
  categories: [],
};

function submitForm() {
  fireEvent.submit(
    screen.getByRole("button", { name: /create/i }).closest("form")
  );
}

describe("CreateTask — BL #20 summary-fetch failure regression", () => {
  let mockDispatch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi.fn();
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockReturnValue(baseSelector);
  });

  it("calls onClose even when fetchSummary rejects after successful task creation", async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === "summary/fetchSummary") {
        return { unwrap: () => Promise.reject(new Error("network")) };
      }
      return { unwrap: () => Promise.resolve({ _id: "t1" }) };
    });

    const onClose = vi.fn();
    render(<CreateTask onClose={onClose} />);

    await act(async () => { submitForm(); });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does NOT call onClose when createNewTask rejects", async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === "tasks/createNewTask") {
        return { unwrap: () => Promise.reject(new Error("server error")) };
      }
      return { unwrap: () => Promise.resolve({}) };
    });

    const onClose = vi.fn();
    render(<CreateTask onClose={onClose} />);

    await act(async () => { submitForm(); });

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("CreateTask — BL #24 startDate midnight regression", () => {
  let mockDispatch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi
      .fn()
      .mockReturnValue({ unwrap: () => Promise.resolve({ _id: "t1" }) });
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockReturnValue({
      ...baseSelector,
      formTask: { ...baseFormTask, startDate: "" },
    });
  });

  it("defaults to local midnight when formTask.startDate is unset", async () => {
    render(<CreateTask onClose={() => {}} />);

    await act(async () => { submitForm(); });

    expect(createNewTask).toHaveBeenCalled();
    const taskData = createNewTask.mock.calls[0][0];
    const startDate = new Date(taskData.startDate);
    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(startDate.getSeconds()).toBe(0);
    expect(startDate.getMilliseconds()).toBe(0);
  });

  it("preserves an explicit startDate already set in formTask", async () => {
    const explicit = "2026-06-10T00:00:00.000Z";
    useSelector.mockReturnValue({
      ...baseSelector,
      formTask: { ...baseFormTask, startDate: explicit },
    });

    render(<CreateTask onClose={() => {}} />);

    await act(async () => { submitForm(); });

    const taskData = createNewTask.mock.calls[0][0];
    expect(taskData.startDate).toBe(explicit);
  });
});
