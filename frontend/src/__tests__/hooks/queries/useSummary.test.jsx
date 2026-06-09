/* eslint-disable react/prop-types, react/display-name -- trivial test wrapper */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useSummaryQuery, useSummaryByCategoryQuery } from "../../../hooks/queries/useSummary";

vi.mock("../../../functions/summary", () => ({
  getSummaryTask: vi.fn(),
  getSummaryTaskByCategory: vi.fn(),
}));

import { getSummaryTask, getSummaryTaskByCategory } from "../../../functions/summary";

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, throwOnError: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useSummaryQuery", () => {
  let consoleError;
  beforeEach(() => {
    getSummaryTask.mockReset();
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it("returns summary data on success", async () => {
    const mockData = [{ completedTasks: 3, totalTasks: 5, completedRate: 60 }];
    getSummaryTask.mockResolvedValue(mockData);

    const { result } = renderHook(() => useSummaryQuery(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("starts in loading state before data resolves", async () => {
    let resolve;
    getSummaryTask.mockReturnValue(new Promise((r) => { resolve = r; }));

    const { result } = renderHook(() => useSummaryQuery(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    resolve([]);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("sets isError on failure", async () => {
    getSummaryTask.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useSummaryQuery(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe("network error");
  });
});

describe("useSummaryByCategoryQuery", () => {
  let consoleError;
  beforeEach(() => {
    getSummaryTaskByCategory.mockReset();
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it("returns category summary data on success", async () => {
    const mockData = [{ category: "Work", completedRate: 75 }];
    getSummaryTaskByCategory.mockResolvedValue(mockData);

    const { result } = renderHook(() => useSummaryByCategoryQuery(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("starts in loading state before data resolves", async () => {
    let resolve;
    getSummaryTaskByCategory.mockReturnValue(new Promise((r) => { resolve = r; }));

    const { result } = renderHook(() => useSummaryByCategoryQuery(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    resolve([]);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
