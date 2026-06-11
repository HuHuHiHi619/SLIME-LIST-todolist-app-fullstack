import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useFetchTask from "../../hooks/useFetchTask";

vi.mock("../../functions/task", () => ({
  getData: vi.fn(),
}));

import { getData } from "../../functions/task";

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe("useFetchTask (TQ-backed)", () => {
  beforeEach(() => {
    getData.mockClear();
  });

  it("returns tasks from the query result", async () => {
    const mockTasks = [{ _id: "a", title: "Task A" }];
    getData.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useFetchTask({ status: "pending" }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });
    expect(getData).toHaveBeenCalledWith({ status: "pending" });
  });

  it("returns empty array while loading", () => {
    getData.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useFetchTask({ status: "pending" }), {
      wrapper: makeWrapper(),
    });

    expect(result.current.tasks).toEqual([]);
  });

  it("does not refetch when parent re-renders with a new-but-equal filter object", async () => {
    const mockTasks = [{ _id: "b" }];
    getData.mockResolvedValue(mockTasks);

    const { rerender } = renderHook(
      ({ filter }) => useFetchTask(filter),
      {
        wrapper: makeWrapper(),
        initialProps: { filter: { status: "pending" } },
      }
    );

    await waitFor(() => expect(getData).toHaveBeenCalledTimes(1));

    // TQ deduplicates by queryKey — same serialized key, no extra fetch
    rerender({ filter: { status: "pending" } });
    rerender({ filter: { status: "pending" } });
    expect(getData).toHaveBeenCalledTimes(1);
  });

  it("refetches when the filter content actually changes", async () => {
    getData.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ filter }) => useFetchTask(filter),
      {
        wrapper: makeWrapper(),
        initialProps: { filter: { status: "pending" } },
      }
    );

    await waitFor(() => expect(getData).toHaveBeenCalledTimes(1));
    rerender({ filter: { status: "completed" } });
    await waitFor(() => expect(getData).toHaveBeenCalledTimes(2));
  });
});
