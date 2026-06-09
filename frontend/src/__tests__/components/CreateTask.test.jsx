/* eslint-disable react/prop-types */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useDispatch: vi.fn(), useSelector: vi.fn() };
});

vi.mock("../../components/forms/inputField", () => ({
  default: ({ value, onChange, name, onKeyDown }) => (
    <input
      data-testid={`input-${name}`}
      value={value ?? ""}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  ),
}));
vi.mock("../../components/forms/StartDatePicker",   () => ({ default: () => null }));
vi.mock("../../components/forms/DeadlinePicker",    () => ({ default: () => null }));
vi.mock("../../components/dashboard/ProgressField",     () => ({ default: () => null }));
vi.mock("../../components/forms/CategoryTagField",  () => ({ default: () => null }));
vi.mock("../../components/forms/PriorityField",     () => ({ default: () => null }));
vi.mock("../../components/feedback/Tooltip",           () => ({ default: ({ children }) => <>{children}</> }));
vi.mock("../../components/animation/FadeUpContainer", () => ({
  default: ({ children }) => <>{children}</>,
}));
vi.mock("@fortawesome/react-fontawesome", () => ({ FontAwesomeIcon: () => null }));
vi.mock("@fortawesome/free-solid-svg-icons", () => ({ faXmark: "faXmark" }));
vi.mock("react-datepicker/dist/react-datepicker.css", () => ({}));

vi.mock("../../hooks/queries/useTasks", () => ({
  useCategoriesQuery: vi.fn(() => ({ data: [] })),
  useCreateTaskMutation: vi.fn(),
}));

vi.mock("../../redux/formSlice", () => ({
  setFormTask: vi.fn((p) => ({ type: "form/setFormTask", payload: p })),
  addSteps:    vi.fn((p) => ({ type: "form/addSteps", payload: p })),
  removeStep:  vi.fn((p) => ({ type: "form/removeStep", payload: p })),
}));

import CreateTask from "../../components/task/CreateTask";
import { useCreateTaskMutation } from "../../hooks/queries/useTasks";
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
};

function submitForm() {
  fireEvent.submit(
    screen.getByRole("button", { name: /create/i }).closest("form")
  );
}

describe("CreateTask — mutation success / failure", () => {
  let mockMutate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    useCreateTaskMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
    useDispatch.mockReturnValue(vi.fn());
    useSelector.mockReturnValue(baseSelector);
  });

  it("calls onClose when mutate fires the onSuccess callback", async () => {
    mockMutate.mockImplementation((_data, { onSuccess }) => onSuccess());
    const onClose = vi.fn();
    render(<CreateTask onClose={onClose} />);

    await act(async () => { submitForm(); });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does NOT call onClose when mutate fires the onError callback", async () => {
    mockMutate.mockImplementation((_data, { onError }) => onError(new Error("server error")));
    const onClose = vi.fn();
    render(<CreateTask onClose={onClose} />);

    await act(async () => { submitForm(); });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows an inline error message when mutation fails", async () => {
    mockMutate.mockImplementation((_data, { onError }) => onError(new Error("fail")));
    render(<CreateTask onClose={() => {}} />);

    await act(async () => { submitForm(); });

    expect(screen.getByText(/failed to create task/i)).toBeTruthy();
  });
});

describe("CreateTask — BL #24 startDate midnight regression", () => {
  let mockMutate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate = vi.fn();
    useCreateTaskMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
    useDispatch.mockReturnValue(vi.fn());
    useSelector.mockReturnValue({
      ...baseSelector,
      formTask: { ...baseFormTask, startDate: "" },
    });
  });

  it("defaults to UTC midnight when formTask.startDate is unset", async () => {
    render(<CreateTask onClose={() => {}} />);

    await act(async () => { submitForm(); });

    expect(mockMutate).toHaveBeenCalled();
    const taskData = mockMutate.mock.calls[0][0];
    const startDate = new Date(taskData.startDate);
    expect(startDate.getUTCHours()).toBe(0);
    expect(startDate.getUTCMinutes()).toBe(0);
    expect(startDate.getUTCSeconds()).toBe(0);
    expect(startDate.getUTCMilliseconds()).toBe(0);
  });

  it("preserves an explicit startDate already set in formTask", async () => {
    const explicit = "2026-06-10T00:00:00.000Z";
    useSelector.mockReturnValue({
      ...baseSelector,
      formTask: { ...baseFormTask, startDate: explicit },
    });

    render(<CreateTask onClose={() => {}} />);

    await act(async () => { submitForm(); });

    const taskData = mockMutate.mock.calls[0][0];
    expect(taskData.startDate).toBe(explicit);
  });
});
