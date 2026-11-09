import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
  website: z.string().max(200).optional(),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;