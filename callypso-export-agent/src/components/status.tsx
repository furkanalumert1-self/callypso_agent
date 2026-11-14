import { Badge, type Tone } from "./ui";
import { inquiryLabel, quoteLabel } from "@/lib/agent";
import type { ApprovalKind, ApprovalStatus, InquiryStatus, QuoteStatus } from "@/lib/types";

const inquiryTone: Record<InquiryStatus, Tone> = { new: "amber", reviewing: "teal", awaiting_info: "gray", ready: "lime", quoted: "emerald" };
const quoteTone: Record<QuoteStatus, Tone> = { draft: "gray", pending_approval: "amber", sent: "teal", no_reply: "red", accepted: "emerald", rejected: "gray" };
const approvalTone: Record<ApprovalStatus, Tone> = { pending: "amber", approved: "emerald", rejected: "red" };
const approvalText: Record<ApprovalStatus, string> = { pending: "Onay bekliyor", approved: "Onaylandı", rejected: "Reddedildi" };

export const InquiryBadge = ({ s }: { s: InquiryStatus }) => <Badge tone={inquiryTone[s]} dot>{inquiryLabel(s)}</Badge>;
export const QuoteBadge = ({ s }: { s: QuoteStatus }) => <Badge tone={quoteTone[s]} dot>{quoteLabel(s)}</Badge>;
export const ApprovalBadge = ({ s }: { s: ApprovalStatus }) => <Badge tone={approvalTone[s]} dot>{approvalText[s]}</Badge>;
export const kindLabel: Record<ApprovalKind, string> = { reply: "Bilgi talebi yanıtı", quote: "Teklif e-postası", followup: "Takip mesajı" };
