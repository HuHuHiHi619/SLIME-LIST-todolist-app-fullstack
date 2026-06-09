import { describe, it, expect } from "vitest";
import reducer, {
  loginUser,
  logoutUser,
  toggleRegisterPopup,
  setAuthError,
  restoreState,
  setUserData,
} from "../../redux/userSlice";

const init = () => reducer(undefined, { type: "@@INIT" });

describe("userSlice — initial state", () => {
  it("starts as an unauthenticated guest", () => {
    const state = init();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isGuest).toBe(true);
    expect(state.userData.currentBadge).toBe("iron");
    expect(state.userData.id).toBe("");
  });
});

describe("userSlice — sync reducers", () => {
  it("toggleRegisterPopup flips the flag", () => {
    const state = reducer(init(), toggleRegisterPopup());
    expect(state.isRegisterPopup).toBe(true);
  });

  it("setAuthError stores the message", () => {
    const state = reducer(init(), setAuthError("nope"));
    expect(state.authError).toBe("nope");
  });

  it("restoreState returns to defaults", () => {
    const dirty = { ...init(), isAuthenticated: true, isGuest: false, authError: "x" };
    const state = reducer(dirty, restoreState());
    expect(state.isAuthenticated).toBe(false);
    expect(state.isGuest).toBe(true);
    expect(state.authError).toBe(null);
  });
});

describe("userSlice — login lifecycle", () => {
  it("loginUser.pending sets loading and clears auth", () => {
    const state = reducer(init(), { type: loginUser.pending.type });
    expect(state.loading).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.authError).toBe(null);
  });

  it("loginUser.fulfilled authenticates and stores user identity", () => {
    const state = reducer(init(), {
      type: loginUser.fulfilled.type,
      payload: { user: { id: "u1", username: "alice" } },
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isGuest).toBe(false);
    expect(state.userData.id).toBe("u1");
    expect(state.userData.username).toBe("alice");
  });

  it("loginUser.rejected records authError from payload", () => {
    const state = reducer(
      { ...init(), loading: true },
      { type: loginUser.rejected.type, payload: "bad creds" }
    );
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.authError).toBe("bad creds");
  });
});

describe("userSlice — logout and setUserData", () => {
  it("logoutUser.fulfilled resets to guest defaults", () => {
    const loggedIn = {
      ...init(),
      isAuthenticated: true,
      isGuest: false,
      userData: { ...init().userData, id: "u1", username: "alice" },
    };
    const state = reducer(loggedIn, { type: logoutUser.fulfilled.type });
    expect(state.isAuthenticated).toBe(false);
    expect(state.isGuest).toBe(true);
    expect(state.userData.id).toBe("");
  });

  it("setUserData merges profile and authenticates", () => {
    const state = reducer(init(), setUserData({ id: "u9", username: "bob", currentStreak: 4 }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.isGuest).toBe(false);
    expect(state.userData.id).toBe("u9");
    expect(state.userData.currentStreak).toBe(4);
  });

  it("restoreState userData is a fresh object, not shared with a previous reset", () => {
    const a = reducer(init(), restoreState());
    const b = reducer(init(), restoreState());
    expect(a.userData).not.toBe(b.userData);
  });

  it("logoutUser.fulfilled userData is independent from initial state", () => {
    const loggedIn = { ...init(), isAuthenticated: true, isGuest: false };
    const a = reducer(loggedIn, { type: logoutUser.fulfilled.type });
    const b = reducer(loggedIn, { type: logoutUser.fulfilled.type });
    expect(a.userData).not.toBe(b.userData);
  });
});
