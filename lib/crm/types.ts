export const prospectStatuses = [
  "nouveau",
  "a_enrichir",
  "à contacter",
  "contacté",
  "relance prévue",
  "rendez-vous",
  "client",
  "perdu",
] as const;

export type ProspectStatus = (typeof prospectStatuses)[number];

export const followUpStatuses = ["prévue", "envoyée", "annulée", "échouée"] as const;
export type FollowUpStatus = (typeof followUpStatuses)[number];

export const followUpChannels = ["email", "téléphone", "linkedin", "autre"] as const;
export type FollowUpChannel = (typeof followUpChannels)[number];

export type ProspectRow = {
  id: number;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  region: string | null;
  department: string | null;
  city: string | null;
  sector: string | null;
  source: string | null;
  status: ProspectStatus;
  score: number;
  notes: string | null;
  ai_score: number | null;
  audit_summary: string | null;
  suggested_email_subject: string | null;
  suggested_email_body: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProspectListRow = Pick<
  ProspectRow,
  | "id"
  | "company_name"
  | "contact_name"
  | "email"
  | "website"
  | "region"
  | "department"
  | "city"
  | "sector"
  | "source"
  | "status"
  | "score"
  | "next_follow_up_at"
  | "updated_at"
>;

export type ProspectFilterOptions = {
  regions: string[];
  departments: string[];
  cities: string[];
  sectors: string[];
};

export type PaginatedProspects = {
  items: ProspectListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CommercialActionStatus = "à_valider" | "à valider" | "validée" | "rejetée" | "envoyée";

export type CommercialActionRow = {
  id: number;
  prospect_id: number;
  type: string;
  status: CommercialActionStatus;
  title: string | null;
  body: string | null;
  notes: string | null;
  sent_at: string | null;
  smtp_message_id: string | null;
  smtp_error: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailDraftStatus = "à_valider" | "validé" | "rejeté" | "envoyé";

export type EmailDraftRow = {
  id: number;
  prospect_id: number;
  subject: string;
  body: string;
  source: string;
  status: EmailDraftStatus;
  sent_at: string | null;
  smtp_message_id: string | null;
  smtp_error: string | null;
  created_at: string;
  updated_at: string;
};

export type AiAuditRow = {
  id: number;
  prospect_id: number;
  score: number | null;
  summary: string | null;
  recommendations: string[] | null;
  source: string;
  created_at: string;
};

export type FollowUpRow = {
  id: number;
  prospect_id: number;
  type: string;
  due_date: string;
  status: FollowUpStatus;
  channel: FollowUpChannel;
  template_key: string | null;
  sent_at: string | null;
  notes: string | null;
  created_at: string;
};

export type ProspectFilters = {
  query?: string;
  status?: ProspectStatus | "all";
  region?: string;
  department?: string;
  city?: string;
  sector?: string;
  page?: number;
  pageSize?: number;
};

export type ProspectInput = {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  region?: string;
  department?: string;
  city?: string;
  sector?: string;
  source?: string;
  status?: ProspectStatus;
  score?: number;
  notes?: string;
  aiScore?: number;
  auditSummary?: string;
  suggestedEmailSubject?: string;
  suggestedEmailBody?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
};

export type OpenClawProspectInput = {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  region?: string;
  department?: string;
  city?: string;
  sector?: string;
  source?: string;
  aiScore?: number;
  auditSummary?: string;
  auditRecommendations?: string[];
  suggestedEmailSubject?: string;
  suggestedEmailBody?: string;
};

export type OpenClawReviewItem = ProspectRow & {
  action_id: number | null;
  action_status: CommercialActionStatus | null;
  action_notes: string | null;
  action_sent_at: string | null;
  action_smtp_message_id: string | null;
  action_smtp_error: string | null;
  draft_id: number | null;
  draft_status: EmailDraftStatus | null;
  draft_subject: string | null;
  draft_body: string | null;
  draft_sent_at: string | null;
  draft_smtp_message_id: string | null;
  draft_smtp_error: string | null;
  audit_id: number | null;
  latest_audit_score: number | null;
  latest_audit_summary: string | null;
  latest_audit_recommendations: string[] | null;
};

export type PaginatedOpenClawReviewItems = {
  items: OpenClawReviewItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type EmailPresenceFilter = "all" | "with" | "without";

export type ProspectImportInput = Pick<
  ProspectInput,
  "companyName" | "country" | "region" | "department" | "city" | "sector" | "website" | "email" | "phone"
>;
