export const POST_CATEGORIES = [
  "Academics",
  "Hostel",
  "Transport",
  "Fees",
  "Exams",
  "Facilities",
  "Events",
  "Other",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export const REPORT_REASONS = [
  "Harassment or Bullying",
  "Hate Speech or Abusive Language",
  "Spam or Misleading",
  "Inappropriate Media / NSFW",
  "False Information / Rumors",
  "Violates University Guidelines",
  "Other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];
