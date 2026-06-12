import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { usePomodoroSession } from "../../../hooks/queries/usePomodoro";
import petReducer from "../../../redux/petSlice";

vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));

import axios from "axios";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const store = configureStore({ reducer: { pet: petReducer } });
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  }
  return { Wrapper, store, queryClient };
}

describe("usePomodoroSession", () => {
  let consoleError;
  beforeEach(() => {
    axios.post.mockReset();
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it("calls POST /pet/pomodoro and dispatches applyPetReward on success", async () => {
    const mockData = { pet: {}, awardedExp: 24, levelsGained: 0 };
    axios.post.mockResolvedValue({ data: mockData });

    const { Wrapper, store } = makeWrapper();
    const { result } = renderHook(() => usePomodoroSession(), { wrapper: Wrapper });

    act(() => { result.current.mutate(); });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(axios.post).toHaveBeenCalledWith("/pet/pomodoro");
    expect(store.getState().pet.lastReward).toEqual({ awardedExp: 24, levelsGained: 0 });
  });

  it("sets isError on failure", async () => {
    axios.post.mockRejectedValue(new Error("cooldown"));

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => usePomodoroSession(), { wrapper: Wrapper });

    act(() => { result.current.mutate(); });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe("cooldown");
  });

  it("does not dispatch applyPetReward when response has no awardedExp", async () => {
    axios.post.mockResolvedValue({ data: {} });

    const { Wrapper, store } = makeWrapper();
    const { result } = renderHook(() => usePomodoroSession(), { wrapper: Wrapper });

    act(() => { result.current.mutate(); });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(store.getState().pet.lastReward).toBeNull();
  });
});
