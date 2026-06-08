const { z } = require("zod");

const CreateCategorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
});

module.exports = { CreateCategorySchema };
