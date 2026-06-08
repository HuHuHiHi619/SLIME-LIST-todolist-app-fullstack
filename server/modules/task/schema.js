const { z } = require("zod");

const ProgressStepSchema = z.object({
  label: z.string(),
  completed: z.boolean().optional(),
});

const ProgressSchema = z
  .object({
    steps: z.array(ProgressStepSchema),
  })
  .optional();

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  note: z.string().optional(),
  startDate: z.string().min(1),
  deadline: z.string().optional(),
  category: z.string().optional(),
  progress: ProgressSchema,
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  note: z.string().optional(),
  startDate: z.string().optional(),
  deadline: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  progress: ProgressSchema,
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
});

module.exports = { CreateTaskSchema, UpdateTaskSchema };
