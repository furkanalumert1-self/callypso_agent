/**
 * Scripted demo agent. No API or LLM is involved: every supported command maps
 * to a deterministic state transition over the demo data.
 */
import type { Approval, ChatAction, ChatMessage, DemoState, Inquiry, Quote } from "./types";
import { COUNTRIES, describeFilters, filterProspects, PROSPECT_STATUS, TYPES } from "./prospects";
import { DEMO_TODAY, SCENARIO_CUSTOMER, SCENARIO_INQUIRY, SCENARIO_PRODUCT, SCENARIO_QTY } from "./data";
import { addDays, eur, eurUiCents, formatDate } from "./format";

export const QUICK_COMMANDS = ["Yeni talepleri incele", "Teklif hazırla", "Yanıtsız teklifleri bul", "Takip mesajı hazırla", "Hedef pazarda müşteri araştır"];

export const SCENARIO_STEPS = [
  "Almanya'dan 200 koltuk talebi geldi",
  "Talep incelendi, eksikler belirlendi",
  "İngilizce yanıt taslağı hazırlandı",
  "Müşteri yanıtı eklendi (E200 · Hamburg)",
  "Katalog fiyatıyla teklif hesaplandı",
  "Taslak düzenlendi ve onaylandı",
  "Teklif güncellendi, takip görevi oluştu",
];

export const SENT_NOTICE = "Demo gönderimi tamamlandı; gerçek e-posta gönderilmedi.";
const SCENARIO_QUOTE = "TKF-2032";

let seq = 0;
export const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export function nowStamp() {
  const d = new Date();
  return `${DEMO_TODAY} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export const agent = (text: string, extra: Partial<ChatMessage> = {}): ChatMessage => ({ id: uid("c"), role: "agent", text, ...extra });
export const act = (label: string, primary = false, command = label): ChatAction => ({ label, command, primary });

export function log(s: DemoState, text: string, kind: DemoState["activities"][number]["kind"]): DemoState {
  return { ...s, activities: [{ id: uid("a"), at: nowStamp(), text, kind }, ...s.activities] };
}

export function say(s: DemoState, ...msgs: ChatMessage[]): DemoState {
  return { ...s, chat: [...s.chat, ...msgs] };
}

export const isUnanswered = (q: Quote) => (q.status === "sent" || q.status === "no_reply") && !!q.followUpDate && q.followUpDate <= DEMO_TODAY;

export const productOf = (s: DemoState, code: string) => s.products.find((p) => p.code === code)!;
export const customerOf = (s: DemoState, id: string) => s.customers.find((c) => c.id === id)!;
const nextApprovalId = (s: DemoState) => `ONY-${301 + s.approvals.length}`;

/* ------------------------------------------------------------------ */

function reviewNew(s: DemoState): DemoState {
  const fresh = s.inquiries.filter((i) => i.status === "new");
  if (!fresh.length) {
    const scenario = s.inquiries.find((i) => i.id === SCENARIO_INQUIRY)!;
    return say(
      s,
      agent("Şu anda yeni talep yok. Nordhaus talebinin durumu: " + inquiryLabel(scenario.status) + ".", {
        actions: nextScenarioActions(s),
      }),
    );
  }
  return say(
    s,
    agent(`${fresh.length} yeni talep bulundu:`, {
      bullets: fresh.map((i) => {
        const c = customerOf(s, i.customerId);
        return `${i.id} · ${c.company} (${c.country}) — "${i.subject}"`;
      }),
      actions: [
        ...(fresh.some((i) => i.id === SCENARIO_INQUIRY) ? [act("Talebi incele", true)] : []),
        ...fresh.filter((i) => i.prospectId).map((i) => act(`${i.id} için teklif hazırla`, !fresh.some((x) => x.id === SCENARIO_INQUIRY), `Teklif hazırla ${i.id}`)),
      ],
    }),
  );
}

function reviewInquiry(s: DemoState): DemoState {
  if (s.step >= 2) {
    return say(s, agent("TLP-1042 zaten incelendi. Sağ paneldeki görev detaylarından devam edebilirsiniz.", { actions: nextScenarioActions(s) }));
  }
  let n: DemoState = {
    ...s,
    step: 2,
    inquiries: s.inquiries.map((i) => (i.id === SCENARIO_INQUIRY ? { ...i, status: "reviewing" } : i)),
  };
  n = log(n, "TLP-1042 incelendi: ürün modeli ve teslimat şehri eksik.", "inquiry");
  return say(
    n,
    agent("TLP-1042 incelendi. Mesajdan çıkarılan bilgiler:", {
      bullets: ["Ürün: Ergonomik ofis koltuğu", "Miktar: 200 adet", "Ülke: Almanya · Teslim şekli: DAP", "Eksik: ürün modeli, teslimat şehri"],
      note: "Eksik bilgiler tamamlanmadan fiyat hesaplanamaz.",
      actions: [act("Yanıt taslağı hazırla", true)],
    }),
  );
}

function draftReply(s: DemoState): DemoState {
  if (s.step < 2) return say(s, agent("Önce talebi incelemem gerekiyor.", { actions: [act("Talebi incele", true)] }));
  if (s.step >= 3) {
    const pending = s.approvals.find((a) => a.kind === "reply" && a.status === "pending");
    return say(s, agent(pending ? "Yanıt taslağı hazır ve onay bekliyor. Sağ panelden düzenleyip onaylayabilirsiniz." : "Yanıt taslağı zaten gönderildi.", { actions: nextScenarioActions(s) }));
  }
  const c = customerOf(s, SCENARIO_CUSTOMER);
  const approval: Approval = {
    id: nextApprovalId(s),
    kind: "reply",
    title: "Bilgi talebi yanıtı · TLP-1042",
    customerId: c.id,
    refId: SCENARIO_INQUIRY,
    to: c.email,
    subject: "Re: Inquiry: 200 office chairs",
    body:
      "Dear Jonas,\n\nThank you for your inquiry for 200 ergonomic office chairs. To prepare an accurate quotation, could you please confirm:\n\n1. The preferred model – e.g. Ergo Basic E150, Ergo Pro E200 or Executive X300 (catalogue attached)\n2. The delivery city in Germany\n\nOnce we have these details, we will send our offer within one business day.\n\nBest regards,\nElif Yıldız\nExport Manager · Atlas Office Furniture",
    status: "pending",
    createdAt: nowStamp(),
  };
  let n: DemoState = { ...s, step: 3, approvals: [approval, ...s.approvals], focusApprovalId: approval.id };
  n = log(n, `TLP-1042 için İngilizce yanıt taslağı hazırlandı (${approval.id}).`, "approval");
  return say(
    n,
    agent("Eksik bilgileri soran İngilizce yanıt taslağı hazırlandı. Sağ panelde inceleyip düzenleyebilir, ardından demo onayı verebilirsiniz.", {
      note: `Onay kaydı: ${approval.id}`,
    }),
  );
}

function loadCustomerReply(s: DemoState): DemoState {
  if (s.step >= 4) return say(s, agent("Müşteri yanıtı zaten eklendi.", { actions: nextScenarioActions(s) }));
  const replySent = s.approvals.some((a) => a.kind === "reply" && a.status === "approved");
  if (!replySent) {
    return say(s, agent("Müşteri yanıtını yüklemeden önce bilgi talebi taslağının onaylanıp gönderilmesi gerekiyor.", { actions: nextScenarioActions(s) }));
  }
  let n: DemoState = {
    ...s,
    step: 4,
    inquiries: s.inquiries.map((i) =>
      i.id === SCENARIO_INQUIRY
        ? {
            ...i,
            status: "ready",
            messages: [
              ...i.messages,
              {
                from: "customer",
                date: nowStamp(),
                subject: "Re: Inquiry: 200 office chairs",
                body: "Hi Elif,\n\nThanks for the quick reply. We would like the Ergo Pro E200 model. Delivery address is our warehouse in Hamburg.\n\nBest,\nJonas",
              },
            ],
            extracted: [
              { label: "Ürün", value: "AT-E200 Ergo Pro" },
              { label: "Miktar", value: "200 adet" },
              { label: "Ülke", value: "Almanya" },
              { label: "Teslimat şehri", value: "Hamburg" },
              { label: "Teslim şekli", value: "DAP" },
            ],
            missing: [],
          }
        : i,
    ),
    customers: s.customers.map((c) =>
      c.id === SCENARIO_CUSTOMER ? { ...c, history: [{ date: DEMO_TODAY, channel: "E-posta", summary: "Model (E200) ve teslimat şehri (Hamburg) bilgisini iletti." }, ...c.history] } : c,
    ),
  };
  n = log(n, "Örnek müşteri yanıtı yüklendi: E200 modeli, teslimat Hamburg.", "inquiry");
  return say(
    n,
    agent("Örnek müşteri yanıtı yüklendi. Talep bilgileri tamamlandı:", {
      bullets: ["Model: AT-E200 Ergo Pro", "Teslimat: Hamburg, Almanya (DAP)", "Eksik bilgi kalmadı"],
      actions: [act("Teklif hazırla", true)],
    }),
  );
}

/** Inquiries created via prospecting that can be quoted (no quote yet, or a rejected draft). */
function quotableProspectInquiries(s: DemoState) {
  return s.inquiries.filter(
    (i) => i.prospectId && i.request && i.status !== "quoted" && !s.quotes.some((q) => q.inquiryId === i.id && q.status !== "draft"),
  );
}

function prepareProspectQuote(s: DemoState, inq: Inquiry): DemoState {
  const r = inq.request!;
  const p = productOf(s, r.productCode);
  const c = customerOf(s, inq.customerId);
  const existing = s.quotes.find((q) => q.inquiryId === inq.id);
  const maxNo = Math.max(2040, ...s.quotes.map((q) => Number(q.id.slice(4)) || 0));
  const total = p.priceEur * r.quantity;
  const quote: Quote = {
    id: existing?.id ?? `TKF-${maxNo + 1}`,
    customerId: c.id,
    inquiryId: inq.id,
    productCode: p.code,
    quantity: r.quantity,
    unitPrice: p.priceEur,
    status: "pending_approval",
    createdAt: DEMO_TODAY,
  };
  const country = COUNTRIES[s.prospects.find((x) => x.id === inq.prospectId)?.country ?? "DE"].en;
  const approval: Approval = {
    id: nextApprovalId(s),
    kind: "quote",
    title: `Teklif e-postası · ${quote.id}`,
    customerId: c.id,
    refId: quote.id,
    to: c.email,
    subject: `Quotation ${quote.id} – ${r.quantity} × ${p.code}`,
    body: `Dear ${c.company} purchasing team,\n\nThank you for your interest. Please find our quotation below:\n\nProduct: ${p.code} (${p.name})\nQuantity: ${r.quantity} units\nUnit price: ${eur(p.priceEur)}\nTotal: ${eur(total)}\nDelivery: DAP ${r.deliveryCity}, ${country}\nLead time: ${p.leadTimeDays} days after order confirmation\nValidity: 30 days\n\nBest regards,\nElif Yıldız\nExport Manager · Atlas Office Furniture`,
    status: "pending",
    createdAt: nowStamp(),
  };
  let n: DemoState = {
    ...s,
    quotes: existing ? s.quotes.map((q) => (q.id === quote.id ? quote : q)) : [quote, ...s.quotes],
    inquiries: s.inquiries.map((i) => (i.id === inq.id ? { ...i, status: "ready" } : i)),
    approvals: [approval, ...s.approvals],
    focusApprovalId: approval.id,
  };
  n = log(n, `${quote.id} hesaplandı (${inq.id}): ${r.quantity} × ${eurUiCents(p.priceEur)} = ${eurUiCents(total)}.`, "quote");
  return say(
    n,
    agent(`${c.company} talebi (${inq.id}) için katalogdaki örnek fiyatla teklif hesaplandı:`, {
      bullets: [`${p.code} ${p.name}`, `${r.quantity} adet × ${eurUiCents(p.priceEur)} = ${eurUiCents(total)}`, `Min. sipariş ${p.moq} adet ✓ · Üretim süresi ${p.leadTimeDays} gün`],
      note: `Teklif e-postası onay bekliyor (${approval.id}). Sağ panelde düzenleyebilirsiniz.`,
    }),
  );
}

function prepareQuote(s: DemoState, inquiryId?: string): DemoState {
  const prospectInqs = quotableProspectInquiries(s);
  const explicit = inquiryId && prospectInqs.find((i) => i.id === inquiryId);
  if (explicit) return prepareProspectQuote(s, explicit);
  if (inquiryId && inquiryId !== SCENARIO_INQUIRY) {
    return say(s, agent(`${inquiryId} için hazırlanacak yeni bir teklif yok; mevcut teklif durumunu Teklifler ekranında görebilirsiniz.`));
  }
  if (!inquiryId && s.step !== 4 && prospectInqs.length) return prepareProspectQuote(s, prospectInqs[0]);
  if (s.step < 4) {
    return say(
      s,
      agent("Teklif için ürün modeli ve teslimat şehri gerekli; TLP-1042'de bu bilgiler henüz eksik.", { actions: nextScenarioActions(s) }),
    );
  }
  if (s.step >= 5) {
    const q = s.quotes.find((x) => x.id === SCENARIO_QUOTE)!;
    return say(s, agent(`${q.id} zaten hazır. Durum: ${quoteLabel(q.status)}.`, { actions: nextScenarioActions(s) }));
  }
  const p = productOf(s, SCENARIO_PRODUCT);
  const c = customerOf(s, SCENARIO_CUSTOMER);
  const total = p.priceEur * SCENARIO_QTY;
  const quote: Quote = {
    id: SCENARIO_QUOTE,
    customerId: c.id,
    inquiryId: SCENARIO_INQUIRY,
    productCode: p.code,
    quantity: SCENARIO_QTY,
    unitPrice: p.priceEur,
    status: "pending_approval",
    createdAt: DEMO_TODAY,
  };
  const approval: Approval = {
    id: nextApprovalId(s),
    kind: "quote",
    title: `Teklif e-postası · ${quote.id}`,
    customerId: c.id,
    refId: quote.id,
    to: c.email,
    subject: `Quotation ${quote.id} – 200 × Ergo Pro E200 chairs`,
    body:
      `Dear Jonas,\n\nThank you for confirming the details. Please find our quotation below:\n\nProduct: ${p.name.replace("Ergonomik Koltuk", "ergonomic chair")} (${p.code})\nQuantity: ${SCENARIO_QTY} units\nUnit price: ${eur(p.priceEur)}\nTotal: ${eur(total)}\nDelivery: DAP Hamburg, Germany\nLead time: ${p.leadTimeDays} days after order confirmation\nValidity: 30 days\n\nWe would be happy to arrange a sample if helpful.\n\nBest regards,\nElif Yıldız\nExport Manager · Atlas Office Furniture`,
    status: "pending",
    createdAt: nowStamp(),
  };
  const exists = s.quotes.some((q) => q.id === quote.id);
  let n: DemoState = {
    ...s,
    step: 5,
    quotes: exists ? s.quotes.map((q) => (q.id === quote.id ? quote : q)) : [quote, ...s.quotes],
    approvals: [approval, ...s.approvals],
    focusApprovalId: approval.id,
  };
  n = log(n, `${quote.id} hesaplandı: ${SCENARIO_QTY} × ${eurUiCents(p.priceEur)} = ${eurUiCents(total)}.`, "quote");
  return say(
    n,
    agent("Katalogdaki örnek fiyatla teklif hesaplandı:", {
      bullets: [
        `${p.code} ${p.name}`,
        `${SCENARIO_QTY} adet × ${eurUiCents(p.priceEur)} = ${eurUiCents(total)}`,
        `Min. sipariş ${p.moq} adet ✓ · Üretim süresi ${p.leadTimeDays} gün`,
      ],
      note: `Teklif e-postası onay bekliyor (${approval.id}). Sağ panelde düzenleyebilirsiniz.`,
    }),
  );
}

function findUnanswered(s: DemoState): DemoState {
  const list = s.quotes.filter(isUnanswered);
  if (!list.length) return say(s, agent("Takip tarihi geçmiş yanıtsız teklif yok.", { actions: [act("Yeni talepleri incele")] }));
  return say(
    s,
    agent(`Takip tarihi gelmiş ${list.length} yanıtsız teklif bulundu:`, {
      bullets: list.map((q) => {
        const c = customerOf(s, q.customerId);
        return `${q.id} · ${c.company} — ${eurUiCents(q.unitPrice * q.quantity)} · takip: ${formatDate(q.followUpDate!)}`;
      }),
      actions: [act("Takip mesajı hazırla", true)],
    }),
  );
}

function draftFollowUp(s: DemoState): DemoState {
  const candidates = s.quotes.filter(isUnanswered);
  const target = candidates.find((q) => !s.approvals.some((a) => a.kind === "followup" && a.refId === q.id && a.status === "pending"));
  if (!target) {
    const pending = s.approvals.filter((a) => a.kind === "followup" && a.status === "pending");
    return say(
      s,
      agent(
        candidates.length
          ? `Tüm yanıtsız teklifler için takip taslağı zaten hazır (${pending.map((a) => a.id).join(", ")}). Onaylar ekranından inceleyebilirsiniz.`
          : "Takip mesajı gerektiren teklif yok.",
      ),
    );
  }
  const c = customerOf(s, target.customerId);
  const p = productOf(s, target.productCode);
  const first = c.contact.split(" ")[0];
  const approval: Approval = {
    id: nextApprovalId(s),
    kind: "followup",
    title: `Takip mesajı · ${target.id}`,
    customerId: c.id,
    refId: target.id,
    to: c.email,
    subject: `Follow-up: Quotation ${target.id}`,
    body: `Dear ${first},\n\nI hope you are well. I am following up on our quotation ${target.id} for ${target.quantity} × ${p.code} (${eur(target.unitPrice)} per unit, total ${eur(target.unitPrice * target.quantity)}), sent on ${formatDate(target.sentAt!, "en")}.\n\nIs there anything we can clarify, or would a sample help with your decision?\n\nBest regards,\nElif Yıldız\nAtlas Office Furniture`,
    status: "pending",
    createdAt: nowStamp(),
  };
  let n: DemoState = { ...s, approvals: [approval, ...s.approvals], focusApprovalId: approval.id };
  n = log(n, `${c.company} için takip mesajı taslağı hazırlandı (${approval.id}).`, "approval");
  return say(n, agent(`${c.company} için ${target.id} takip mesajı hazırlandı. Taslak sağ panelde ve Onaylar ekranında.`, { note: `Onay kaydı: ${approval.id}` }));
}

function researchProspects(s: DemoState): DemoState {
  const f = s.prospectFilters;
  const list = filterProspects(s.prospects, f);
  const n: DemoState = { ...s, prospectsShown: true };
  return say(
    n,
    agent(
      list.length
        ? `Seçili filtrelerle (${describeFilters(f)}) ${list.length} örnek aday listelendi:`
        : `Seçili filtrelerle (${describeFilters(f)}) eşleşen örnek aday yok. Müşteri Bulma ekranında filtreleri değiştirebilirsiniz.`,
      {
        bullets: list.map((p) => `${p.company} · ${COUNTRIES[p.country].tr} · ${TYPES[p.type].tr} — ${PROSPECT_STATUS[p.status]}`),
        note: "Örnek veri — gerçek araştırma yapılmaz. Sonuçlar demo listesinden filtrelenir.",
        actions: [{ label: "Sonuçları Müşteri Bulma'da aç", command: "", href: "/musteri-bulma", primary: true }],
      },
    ),
  );
}

/* ------------------------------------------------------------------ */

export function nextScenarioActions(s: DemoState): ChatAction[] {
  switch (s.step) {
    case 1:
      return [act("Talebi incele", true)];
    case 2:
      return [act("Yanıt taslağı hazırla", true)];
    case 3:
      return s.approvals.some((a) => a.kind === "reply" && a.status === "approved") ? [act("Örnek müşteri yanıtını yükle", true)] : [];
    case 4:
      return [act("Teklif hazırla", true)];
    case 7:
      return [act("Yanıtsız teklifleri bul"), act("Takip mesajı hazırla")];
    default:
      return [];
  }
}

const norm = (t: string) => t.toLocaleLowerCase("tr").replace(/\s+/g, " ").trim();

export function runCommand(s: DemoState, raw: string): DemoState {
  const text = raw.trim();
  if (!text) return s;
  const withUser = say(s, { id: uid("c"), role: "user", text });
  const t = norm(text);

  if (t.includes("araştır") || t.includes("aday") || t.includes("hedef pazar")) return researchProspects(withUser);
  if (t.includes("müşteri yanıt") || t.includes("yanıtı yükle")) return loadCustomerReply(withUser);
  if (t.includes("taslağı hazırla") || t.includes("yanıt taslağı")) return draftReply(withUser);
  if (t.includes("yanıtsız") || t.includes("cevapsız")) return findUnanswered(withUser);
  if (t.includes("takip")) return draftFollowUp(withUser);
  if (t.includes("talebi incele") || t === "incele") return reviewInquiry(withUser);
  if (t.includes("talep")) return reviewNew(withUser);
  if (t.includes("teklif")) return prepareQuote(withUser, text.match(/TLP-\d+/i)?.[0].toUpperCase());

  return say(
    withUser,
    agent("Bu demo gerçek bir yapay zekâ modeline bağlı değil; yalnızca tanımlı demo komutlarını çalıştırabilirim. Şunlardan birini deneyin:", {
      actions: QUICK_COMMANDS.map((c) => act(c)),
    }),
  );
}

export function approve(s: DemoState, id: string, edits: { subject: string; body: string }): DemoState {
  const a = s.approvals.find((x) => x.id === id);
  if (!a || a.status !== "pending") return s;
  const edited = edits.subject !== a.subject || edits.body !== a.body;
  let n: DemoState = {
    ...s,
    focusApprovalId: s.focusApprovalId === id ? undefined : s.focusApprovalId,
    approvals: s.approvals.map((x) => (x.id === id ? { ...x, ...edits, edited, status: "approved", decidedAt: nowStamp() } : x)),
    toast: SENT_NOTICE,
  };
  const c = customerOf(s, a.customerId);
  const addHistory = (summary: string): DemoState => ({
    ...n,
    customers: n.customers.map((x) => (x.id === c.id ? { ...x, history: [{ date: DEMO_TODAY, channel: "E-posta", summary }, ...x.history] } : x)),
  });

  if (a.kind === "reply") {
    n = addHistory("Model ve teslimat şehri soruldu (demo gönderimi).");
    n = {
      ...n,
      inquiries: n.inquiries.map((i) =>
        i.id === a.refId ? { ...i, status: "awaiting_info", messages: [...i.messages, { from: "us", date: nowStamp(), subject: edits.subject, body: edits.body }] } : i,
      ),
    };
    n = log(n, `${a.id} onaylandı; TLP-1042 müşteri yanıtı bekliyor.`, "approval");
    return say(n, agent(`${SENT_NOTICE} TLP-1042 artık müşteri yanıtı bekliyor.`, { actions: [act("Örnek müşteri yanıtını yükle", true)] }));
  }

  if (a.kind === "quote" && a.refId !== SCENARIO_QUOTE) {
    const follow = addDays(DEMO_TODAY, 5);
    const q = n.quotes.find((x) => x.id === a.refId)!;
    n = addHistory(`${a.refId} teklifi gönderildi (demo gönderimi).`);
    n = {
      ...n,
      quotes: n.quotes.map((x) => (x.id === a.refId ? { ...x, status: "sent", sentAt: DEMO_TODAY, followUpDate: follow } : x)),
      inquiries: n.inquiries.map((i) => (i.id === q.inquiryId ? { ...i, status: "quoted" } : i)),
      tasks: [
        { id: `GRV-${11 + n.tasks.length}`, title: `${c.company} · ${a.refId} için takip`, dueDate: follow, quoteId: a.refId, customerId: c.id, done: false },
        ...n.tasks,
      ],
    };
    n = log(n, `${a.refId} gönderildi olarak işaretlendi; ${formatDate(follow)} için takip görevi oluşturuldu.`, "task");
    return say(
      n,
      agent(SENT_NOTICE, {
        bullets: [`${a.refId} durumu: Gönderildi`, `Takip görevi: ${formatDate(follow)}`, edited ? "Taslak düzenlenmiş haliyle onaylandı" : "Taslak olduğu gibi onaylandı"],
      }),
    );
  }

  if (a.kind === "quote") {
    const follow = addDays(DEMO_TODAY, 5);
    n = addHistory(`${a.refId} teklifi gönderildi (demo gönderimi).`);
    n = {
      ...n,
      step: 7,
      quotes: n.quotes.map((q) => (q.id === a.refId ? { ...q, status: "sent", sentAt: DEMO_TODAY, followUpDate: follow } : q)),
      inquiries: n.inquiries.map((i) => (i.id === SCENARIO_INQUIRY ? { ...i, status: "quoted" } : i)),
      tasks: [
        { id: `GRV-${11 + n.tasks.length}`, title: `${c.company} · ${a.refId} için takip`, dueDate: follow, quoteId: a.refId, customerId: c.id, done: false },
        ...n.tasks,
      ],
    };
    n = log(n, `${a.refId} gönderildi olarak işaretlendi; ${formatDate(follow)} için takip görevi oluşturuldu.`, "task");
    return say(
      n,
      agent(`${SENT_NOTICE}`, {
        bullets: [`${a.refId} durumu: Gönderildi`, `Takip görevi: ${formatDate(follow)}`, edited ? "Taslak düzenlenmiş haliyle onaylandı" : "Taslak olduğu gibi onaylandı"],
        actions: nextScenarioActions({ ...n }),
      }),
    );
  }

  // follow-up
  const follow = addDays(DEMO_TODAY, 5);
  n = addHistory(`${a.refId} için takip mesajı gönderildi (demo gönderimi).`);
  n = {
    ...n,
    quotes: n.quotes.map((q) => (q.id === a.refId ? { ...q, status: "sent", followUpDate: follow } : q)),
    tasks: n.tasks.map((t) => (t.quoteId === a.refId ? { ...t, done: true } : t)),
  };
  n = { ...n, tasks: [{ id: `GRV-${11 + n.tasks.length}`, title: `${c.company} · ${a.refId} ikinci takip`, dueDate: follow, quoteId: a.refId, customerId: c.id, done: false }, ...n.tasks] };
  n = log(n, `${a.refId} takip mesajı gönderildi; sonraki takip ${formatDate(follow)}.`, "task");
  return say(n, agent(`${SENT_NOTICE} ${a.refId} için sonraki takip ${formatDate(follow)} tarihine planlandı.`));
}

export function reject(s: DemoState, id: string): DemoState {
  const a = s.approvals.find((x) => x.id === id);
  if (!a || a.status !== "pending") return s;
  let n: DemoState = {
    ...s,
    focusApprovalId: s.focusApprovalId === id ? undefined : s.focusApprovalId,
    approvals: s.approvals.map((x) => (x.id === id ? { ...x, status: "rejected", decidedAt: nowStamp() } : x)),
  };
  n = log(n, `${a.id} reddedildi.`, "approval");
  if (a.kind === "reply") {
    n = { ...n, step: 2 };
    return say(n, agent(`${a.id} reddedildi. Yeni bir taslak hazırlayabilirim.`, { actions: [act("Yanıt taslağı hazırla", true)] }));
  }
  if (a.kind === "quote" && a.refId !== SCENARIO_QUOTE) {
    const q = n.quotes.find((x) => x.id === a.refId)!;
    n = { ...n, quotes: n.quotes.map((x) => (x.id === a.refId ? { ...x, status: "draft" } : x)) };
    return say(n, agent(`${a.id} reddedildi; ${a.refId} taslak durumuna alındı.`, { actions: [act("Teklifi yeniden hazırla", true, `Teklif hazırla ${q.inquiryId}`)] }));
  }
  if (a.kind === "quote") {
    n = { ...n, step: 4, quotes: n.quotes.map((q) => (q.id === a.refId ? { ...q, status: "draft" } : q)) };
    return say(n, agent(`${a.id} reddedildi; ${a.refId} taslak durumuna alındı.`, { actions: [act("Teklif hazırla", true)] }));
  }
  return say(n, agent(`${a.id} reddedildi. Gerekirse yeniden takip mesajı hazırlayabilirim.`, { actions: [act("Takip mesajı hazırla")] }));
}

/* ------------------------------------------------------------------ */

export function inquiryLabel(s: string) {
  return ({ new: "Yeni", reviewing: "İnceleniyor", awaiting_info: "Bilgi bekleniyor", ready: "Teklife hazır", quoted: "Teklif verildi" } as Record<string, string>)[s];
}
export function quoteLabel(s: string) {
  return ({ draft: "Taslak", pending_approval: "Onay bekliyor", sent: "Gönderildi", no_reply: "Yanıt yok", accepted: "Kabul edildi", rejected: "Reddedildi" } as Record<string, string>)[s];
}
