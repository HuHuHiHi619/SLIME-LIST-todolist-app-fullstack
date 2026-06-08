const { RegisterSchema, LoginSchema } = require("../../modules/user/schema");

describe("RegisterSchema", () => {
  it("rejects missing username and password", () => {
    const result = RegisterSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects username shorter than 6 characters", () => {
    const result = RegisterSchema.safeParse({ username: "ab", password: "secret123" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Username must be at least 6 characters");
  });

  it("rejects username longer than 20 characters", () => {
    const result = RegisterSchema.safeParse({ username: "a".repeat(21), password: "secret123" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Username must be at most 20 characters");
  });

  it("rejects username with invalid characters", () => {
    const result = RegisterSchema.safeParse({ username: "user!!", password: "secret123" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/letters, numbers/);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = RegisterSchema.safeParse({ username: "validuser", password: "abc" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Password must be at least 6 characters");
  });

  it("accepts a valid body", () => {
    const result = RegisterSchema.safeParse({ username: "validuser", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("accepts valid usernames with underscores and periods", () => {
    const result = RegisterSchema.safeParse({ username: "valid.user_1", password: "secret123" });
    expect(result.success).toBe(true);
  });
});

describe("LoginSchema", () => {
  it("rejects empty body", () => {
    const result = LoginSchema.safeParse({});
    expect(result.success).toBe(false);
    const fields = result.error.flatten().fieldErrors;
    expect(fields.username).toBeDefined();
    expect(fields.password).toBeDefined();
  });

  it("rejects empty string username", () => {
    const result = LoginSchema.safeParse({ username: "", password: "secret" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Username is required");
  });

  it("accepts valid credentials", () => {
    const result = LoginSchema.safeParse({ username: "validuser", password: "secret123" });
    expect(result.success).toBe(true);
  });
});
