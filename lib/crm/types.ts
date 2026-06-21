export const prospectStatuses = [
  "nouveau",
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
  city: string | null;
  sector: string | null;
  source: string | null;
  status: ProspectStatus;
  score: number;
  notes: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
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
  sector?: string;
};

export type ProspectInput = {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  sector?: string;
  source?: string;
  status?: ProspectStatus;
  score?: number;
  notes?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
};

export type ProspectImportInput = Pick<
  ProspectInput,
  "companyName" | "city" | "sector" | "website" | "email" | "phone"
>;

