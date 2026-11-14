export type Product = {
  code: string;
  name: string;
  category: string;
  priceEur: number;
  moq: number;
  leadTimeDays: number;
};

export type HistoryEntry = { date: string; channel: "E-posta" | "Telefon" | "Fuar" | "Toplantı"; summary: string };

export type Customer = {
  id: string;
  company: string;
  country: string;
  flag: string;
  city: string;
  contact: string;
  role: string;
  email: string;
  segment: string;
  history: HistoryEntry[];
};

export type InquiryStatus = "new" | "reviewing" | "awaiting_info" | "ready" | "quoted";

export type InquiryMessage = { from: "customer" | "us"; date: string; subject: string; body: string };

export type Inquiry = {
  id: string;
  customerId: string;
  receivedAt: string;
  subject: string;
  messages: InquiryMessage[];
  extracted: { label: string; value: string }[];
  missing: string[];
  status: InquiryStatus;
};

export type QuoteStatus = "draft" | "pending_approval" | "sent" | "no_reply" | "accepted" | "rejected";

export type Quote = {
  id: string;
  customerId: string;
  inquiryId?: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  status: QuoteStatus;
  createdAt: string;
  sentAt?: string;
  followUpDate?: string;
};

export type ApprovalKind = "reply" | "quote" | "followup";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Approval = {
  id: string;
  kind: ApprovalKind;
  title: string;
  customerId: string;
  refId: string; // inquiry or quote id
  to: string;
  subject: string;
  body: string;
  status: ApprovalStatus;
  createdAt: string;
  decidedAt?: string;
  edited?: boolean;
};

export type FollowTask = {
  id: string;
  title: string;
  dueDate: string;
  quoteId?: string;
  customerId: string;
  done: boolean;
};

export type Activity = { id: string; at: string; text: string; kind: "inquiry" | "quote" | "approval" | "task" | "system" };

export type ChatAction = { label: string; command: string; primary?: boolean };

export type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  bullets?: string[];
  actions?: ChatAction[];
  note?: string;
};

/** Last completed step of the scripted scenario (1–7). */
export type ScenarioStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DemoState = {
  version: number;
  products: Product[];
  customers: Customer[];
  inquiries: Inquiry[];
  quotes: Quote[];
  approvals: Approval[];
  tasks: FollowTask[];
  activities: Activity[];
  chat: ChatMessage[];
  step: ScenarioStep;
  focusApprovalId?: string;
  toast?: string;
};
