const { CreateCategorySchema } = require("../../modules/category/schema");

describe("CreateCategorySchema", () => {
  it("rejects empty body", () => {
    const result = CreateCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty string categoryName", () => {
    const result = CreateCategorySchema.safeParse({ categoryName: "" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Category name is required");
  });

  it("accepts a valid categoryName", () => {
    const result = CreateCategorySchema.safeParse({ categoryName: "Work" });
    expect(result.success).toBe(true);
    expect(result.data.categoryName).toBe("Work");
  });

  it("accepts extra unknown fields without failing", () => {
    const result = CreateCategorySchema.safeParse({ categoryName: "Work", extra: "ignored" });
    expect(result.success).toBe(true);
  });
});
