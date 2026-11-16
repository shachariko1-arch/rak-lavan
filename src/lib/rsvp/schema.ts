import { z } from "zod";

export const DIETARY_OPTIONS = ["vegetarian", "vegan", "gluten_free", "other"] as const;
export type DietaryOption = (typeof DIETARY_OPTIONS)[number];

export const DIETARY_LABELS: Record<DietaryOption | "none", { en: string; he: string }> = {
  vegetarian: { en: "Vegetarian", he: "צמחוני" },
  vegan: { en: "Vegan", he: "טבעוני" },
  gluten_free: { en: "Gluten-free", he: "ללא גלוטן" },
  other: { en: "Other", he: "אחר" },
  none: { en: "No special requirements", he: "ללא דרישות מיוחדות" },
};

export const ATTENDANCE = ["attending", "declined"] as const;
export type Attendance = (typeof ATTENDANCE)[number];

const text = (max: number) => z.string().trim().max(max);

/** What a guest submits. Validated identically in the browser and on the server. */
export const rsvpSubmissionSchema = z
  .object({
    attendance: z.enum(ATTENDANCE),
    attendeesCount: z.number().int().min(0).max(20),
    companionNames: z.array(text(80)).max(19).default([]),
    dietary: z.array(z.enum(DIETARY_OPTIONS)).max(DIETARY_OPTIONS.length).default([]),
    dietaryNotes: text(300).default(""),
    specialRequests: text(600).default(""),
    message: text(600).default(""),
  })
  .superRefine((v, ctx) => {
    if (v.attendance === "attending" && v.attendeesCount < 1) {
      ctx.addIssue({ code: "custom", path: ["attendeesCount"], message: "min_attendees" });
    }
  });

export type RsvpSubmission = z.infer<typeof rsvpSubmissionSchema>;

/** Remove fields that don't apply (a decline never carries attendee details). */
export function normalizeSubmission(v: RsvpSubmission, maxAttendees: number): RsvpSubmission {
  if (v.attendance === "declined") {
    return { ...v, attendeesCount: 0, companionNames: [], dietary: [], dietaryNotes: "" };
  }
  const count = Math.min(v.attendeesCount, maxAttendees);
  return {
    ...v,
    attendeesCount: count,
    companionNames: v.companionNames.slice(0, Math.max(0, count - 1)).filter((n) => n.length > 0),
    dietary: Array.from(new Set(v.dietary)),
    dietaryNotes: v.dietary.includes("other") ? v.dietaryNotes : v.dietaryNotes,
  };
}

export type RsvpErrorCode =
  | "invalid_token"
  | "expired_token"
  | "revoked_token"
  | "not_published"
  | "rsvp_disabled"
  | "deadline_passed"
  | "too_many_attendees"
  | "updates_not_allowed"
  | "rate_limited"
  | "invalid_input"
  | "server_error";
