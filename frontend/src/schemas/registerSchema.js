import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),

    email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Please enter a valid email address"
    ),

    password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[@$!%*?&]/, "Must include at least one special character"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })

  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const defaultRegisterValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};
