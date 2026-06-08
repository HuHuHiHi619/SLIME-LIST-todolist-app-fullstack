const { z } = require("zod");

const RegisterSchema = z.object({
  username: z
    .string()
    .min(6, "Username must be at least 6 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username must contain only letters, numbers, underscores, or periods"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  theme: z.string().optional(),
  notification: z.boolean().optional(),
  lastCompleted: z.string().optional(),
});

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

module.exports = { RegisterSchema, LoginSchema };
