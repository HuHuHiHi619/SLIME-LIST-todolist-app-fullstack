const { CreateTaskSchema, UpdateTaskSchema } = require("../../modules/task/schema");

describe("CreateTaskSchema", () => {
  it("rejects missing title and startDate", () => {
    const result = CreateTaskSchema.safeParse({});
    expect(result.success).toBe(false);
    const fields = result.error.flatten().fieldErrors;
    expect(fields.title).toBeDefined();
    expect(fields.startDate).toBeDefined();
  });

  it("rejects invalid priority", () => {
    const result = CreateTaskSchema.safeParse({
      title: "Task",
      startDate: "2026-07-01",
      priority: "URGENT",
    });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.priority).toBeDefined();
  });

  it("accepts a valid minimal body", () => {
    const result = CreateTaskSchema.safeParse({
      title: "Task",
      startDate: "2026-07-01",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = CreateTaskSchema.safeParse({
      title: "Task",
      startDate: "2026-07-01",
      note: "a note",
      deadline: "2026-08-01",
      category: "Work",
      priority: "high",
      progress: { steps: [{ label: "Step 1", completed: false }] },
    });
    expect(result.success).toBe(true);
  });
});

describe("UpdateTaskSchema", () => {
  it("rejects invalid status", () => {
    const result = UpdateTaskSchema.safeParse({ status: "invalid" });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.status).toBeDefined();
  });

  it("accepts empty body (all fields optional)", () => {
    const result = UpdateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts null deadline (remove deadline)", () => {
    const result = UpdateTaskSchema.safeParse({ deadline: null });
    expect(result.success).toBe(true);
  });

  it("accepts null category (remove category)", () => {
    const result = UpdateTaskSchema.safeParse({ category: null });
    expect(result.success).toBe(true);
  });
});
