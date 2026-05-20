const { Types } = require("mongoose");
const { buildUserFilter } = require("../../shared/utils/userFilter");

// A real ObjectId string — valid 24-char hex, no DB connection needed
const VALID_ID = new Types.ObjectId().toString();

describe("buildUserFilter", () => {
  // ── Authenticated user ────────────────────────────────────────────────────

  it("returns ObjectId formatUser and user filter for authenticated request", () => {
    const req = { user: { id: VALID_ID }, guestId: null };
    const { formatUser, userFilter } = buildUserFilter(req);

    expect(formatUser).not.toBeNull();
    expect(formatUser).toBeInstanceOf(Types.ObjectId);
    expect(formatUser.toString()).toBe(VALID_ID);
    expect(userFilter).toEqual({ user: formatUser });
  });

  it("authenticated user filter does not contain guestId", () => {
    const req = { user: { id: VALID_ID }, guestId: "guest-should-be-ignored" };
    const { userFilter } = buildUserFilter(req);

    expect(userFilter).not.toHaveProperty("guestId");
    expect(userFilter).toHaveProperty("user");
  });

  // ── Guest user ────────────────────────────────────────────────────────────

  it("returns null formatUser and guestId filter for guest request", () => {
    const req = { user: null, guestId: "guest-uuid-abc-123" };
    const { formatUser, userFilter } = buildUserFilter(req);

    expect(formatUser).toBeNull();
    expect(userFilter).toEqual({ guestId: "guest-uuid-abc-123" });
  });

  it("preserves the exact guestId string in the filter", () => {
    const guestId = "550e8400-e29b-41d4-a716-446655440000";
    const req = { user: null, guestId };
    const { userFilter } = buildUserFilter(req);

    expect(userFilter.guestId).toBe(guestId);
  });

  // ── No identity ───────────────────────────────────────────────────────────

  it("returns null userFilter when neither user nor guestId is present", () => {
    const req = { user: null, guestId: null };
    const { formatUser, userFilter } = buildUserFilter(req);

    expect(formatUser).toBeNull();
    // Must be null, NOT {} — an empty object would match all DB documents
    expect(userFilter).toBeNull();
  });

  it("returns null userFilter when req.user is undefined and guestId is undefined", () => {
    const req = {};
    const { formatUser, userFilter } = buildUserFilter(req);

    expect(formatUser).toBeNull();
    expect(userFilter).toBeNull();
  });

  // ── Invalid ObjectId on req.user ──────────────────────────────────────────

  it("treats req.user.id as absent when it is not a valid ObjectId", () => {
    const req = { user: { id: "not-a-valid-objectid" }, guestId: null };
    const { formatUser, userFilter } = buildUserFilter(req);

    expect(formatUser).toBeNull();
    expect(userFilter).toBeNull();
  });

  it("falls back to guestId filter when req.user.id is invalid but guestId exists", () => {
    const req = { user: { id: "bad-id" }, guestId: "guest-fallback" };
    const { formatUser, userFilter } = buildUserFilter(req);

    expect(formatUser).toBeNull();
    expect(userFilter).toEqual({ guestId: "guest-fallback" });
  });

  it("treats req.user with missing id field as unauthenticated", () => {
    const req = { user: {}, guestId: "guest-xyz" };
    const { formatUser, userFilter } = buildUserFilter(req);

    expect(formatUser).toBeNull();
    expect(userFilter).toEqual({ guestId: "guest-xyz" });
  });
});
