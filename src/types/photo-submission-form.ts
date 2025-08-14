import { z } from "zod";

export const photoSubmissionSchema = z.object({
  // Section 1: Basic Franchise Details
  Full_Name: z.string().min(1, "Full name is required"),
  Franchise_District: z.string().min(1, "Franchise district is required"),
  Office_Address: z.string().min(1, "Office address is required"),
  Branding_Completion_Date: z.date({
    required_error: "Branding completion date is required",
  }),

  // Section 2: Photo Uploads
  Front_View_Photo: z.string().optional(),
  Reception_Photo: z.string().optional(),
  Workstations_Photo: z.string().optional(),
  Meeting_Space_Photo: z.string().optional(),
  Branded_Frame_Photo: z.string().optional(),
  Branding_Elements_Count: z.string().optional(),
  Team_Photo: z.string().optional(),

  // Section 3: Confirmation
  Branding_Complete: z.enum(["yes", "no"], {
    required_error: "Please confirm if branding was done as per checklist",
  }),
  Additional_Notes: z.string().optional(),
  Declaration_Confirmed: z.boolean().refine((val) => val === true, {
    message: "You must accept the declaration",
  }),
});

export type PhotoSubmissionFormData = z.infer<typeof photoSubmissionSchema>;