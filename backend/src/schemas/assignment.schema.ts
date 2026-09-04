import { z } from "zod";

export const assignmentStatusSchema = z.enum(["OPEN", "COMPLETED"]);
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;

export const createAssignmentSchema = z.object({
  label: z.string().min(1, "label is required"),
  status: assignmentStatusSchema.optional(),
  clients: z.array(z.string()).optional(),
});

export const listAssignmentsQuerySchema = z.object({
  status: assignmentStatusSchema.optional(),
  search: z.string().optional(),
  _page: z.coerce.number().int().min(1).optional(),
  _per_page: z.coerce.number().int().min(1).max(500).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type ListAssignmentsQuery = z.infer<typeof listAssignmentsQuerySchema>;
