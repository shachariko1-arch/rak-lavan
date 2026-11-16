import type { Dietary, GuestCategory, L10n, RsvpStatus, Side } from "./types";
import { l10n } from "./utils";

/** Display names for every enum in the data model, in both languages. */

export const STATUS_LABEL: Record<RsvpStatus, L10n> = {
  confirmed: l10n("Confirmed", "מגיעים"),
  declined: l10n("Declined", "לא מגיעים"),
  pending: l10n("Pending", "ממתינים לתשובה"),
  not_contacted: l10n("Not contacted", "טרם נשלחה הזמנה"),
};

export const STATUS_SHORT: Record<RsvpStatus, L10n> = {
  confirmed: l10n("Confirmed", "אישרו"),
  declined: l10n("Declined", "סירבו"),
  pending: l10n("Pending", "ממתינים"),
  not_contacted: l10n("Not contacted", "לא נשלח"),
};

export const DIETARY_LABEL: Record<Dietary, L10n> = {
  regular: l10n("Regular", "רגילה"),
  vegetarian: l10n("Vegetarian", "צמחונית"),
  vegan: l10n("Vegan", "טבעונית"),
  gluten_free: l10n("Gluten-free", "ללא גלוטן"),
  kosher_mehadrin: l10n("Glatt kosher", "כשר למהדרין"),
  kids: l10n("Kids' meal", "מנת ילדים"),
  allergy: l10n("Allergy", "אלרגיה"),
};

export const CATEGORY_LABEL: Record<GuestCategory, L10n> = {
  family: l10n("Family", "משפחה"),
  friends: l10n("Friends", "חברים"),
  work: l10n("Work", "עבודה"),
  other: l10n("Other", "אחר"),
};

export const SIDE_LABEL: Record<Side, L10n> = {
  bride: l10n("Bride's side", "צד הכלה"),
  groom: l10n("Groom's side", "צד החתן"),
  both: l10n("Both", "משותף"),
};
