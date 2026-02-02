import { z } from "zod";

// Regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^.{6,}$/; // min 6

export const loginSchema = z.object({
  email: z.string().regex(emailRegex, "Invalid email"),
  password: z.string().regex(passwordRegex, "Password must be at least 6 chars")
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required").max(50),
  email: z.string().regex(emailRegex, "Invalid email"),
  password: z.string().regex(passwordRegex, "Password must be at least 6 chars")
});

// Event schema (client-side)
export const eventSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(5).max(1000),
  category: z.enum(["conference", "workshop", "social", "sports", "other"]).default("other"),
  location: z.string().min(2).max(120),
  date: z.string().min(1, "Date required"),
  endDate: z.string().min(1, "End date required"),
  maxParticipants: z.coerce.number().int().min(1).default(50),
  price: z.coerce.number().min(0).default(0),
  isOutside: z.boolean().default(false),
  status: z.enum(["draft", "published", "cancelled", "completed"]).default("draft")
}).refine((val) => new Date(val.endDate) > new Date(val.date), {
  message: "End date must be after start date",
  path: ["endDate"]
});
