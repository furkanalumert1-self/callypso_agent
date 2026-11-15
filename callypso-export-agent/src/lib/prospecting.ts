/**
 * Prospecting ("Müşteri Bulma") demo actions. Research and outreach approval are separate steps:
 * candidate → listed → draft → contacted (demo send) → replied → converted (customer + inquiry).
 */
import type { Customer, DemoState, Inquiry, Prospect, ProspectFilters } from "./types";
import { DEMO_TODAY } from "./data";
import { COUNTRIES, GROUPS, TYPES } from "./prospects";
import { eur } from "./format";
import { log, nowStamp, productOf, SENT_NOTICE } from "./agent";

const patch = (s: DemoState, id: string, f: (p: Prospect) => Partial<Prospect>): DemoState => ({
  ...s,
  prospects: s.prospects.map((p) => (p.id === id ? { ...p, ...f(p) } : p)),
});
const find = (s: DemoState, id: string) => s.prospects.find((p) => p.id === id);

export function showProspects(s: DemoState, filters: ProspectFilters): DemoState {
  return { ...s, prospectFilters: filters, prospectsShown: true };
}

export function addToList(s: DemoState, id: string): DemoState {
  const p = find(s, id);
  if (!p || p.status !== "candidate") return s;
  return log(patch(s, id, () => ({ status: "listed" })), `${p.company} müşteri adayı listesine eklendi.`, "system");
}

function outreachDraft(s: DemoState, p: Prospect) {
  const country = COUNTRIES[p.country].en;
  const lines = p.groups.flatMap((g) =>
    s.products
      .filter((x) => (g === "chair" ? ["Koltuk", "Sandalye"] : ["Masa"]).includes(x.category))
      .slice(0, 2)
      .map((x) => `- ${x.code} ${x.name.replace(/ (Çalışma|Ergonomik|Yönetici|Toplantı|Yükseklik Ayarlı) .*$/, "")}: from ${eur(x.priceEur)}, MOQ ${x.moq} units, ${x.leadTimeDays}-day lead time`),
  );
  const focus = p.groups.map((g) => GROUPS[g].en).join(" and ");
  return {
    subject: `Atlas Office Furniture – ${focus} for ${p.company}`,
    body:
      `Dear ${p.company} purchasing team,\n\n` +
      `My name is Elif Yıldız, Export Manager at Atlas Office Furniture, an office furniture manufacturer based in İnegöl, Türkiye.\n\n` +
      `As a ${TYPES[p.type].en} serving customers in ${country}, ${p.company} may be interested in our ${focus}. A few examples from our catalogue:\n\n` +
      `${lines.join("\n")}\n\n` +
      `We deliver DAP to ${country} and can provide samples before a first order. Would you be open to receiving our full catalogue and price list?\n\n` +
      `Best regards,\nElif Yıldız\nExport Manager · Atlas Office Furniture`,
  };
}

export function prepareContact(s: DemoState, id: string): DemoState {
  const p = find(s, id);
  if (!p || p.status !== "listed") return s;
  return log(patch(s, id, () => ({ status: "draft", draft: outreachDraft(s, p) })), `${p.company} için ilk temas taslağı hazırlandı.`, "approval");
}

export function confirmSend(s: DemoState, id: string, draft: { subject: string; body: string }): DemoState {
  const p = find(s, id);
  if (!p || p.status !== "draft") return s;
  const n = patch(s, id, () => ({ status: "contacted", draft, sentAt: nowStamp() }));
  return { ...log(n, `${p.company} ilk temas mesajı demo olarak gönderildi.`, "approval"), toast: SENT_NOTICE };
}

export function loadPositiveReply(s: DemoState, id: string): DemoState {
  const p = find(s, id);
  if (!p || p.status !== "contacted") return s;
  const prod = productOf(s, p.sampleRequest.productCode);
  const model = prod.code.replace("AT-", "");
  const noun = prod.category === "Masa" ? "desks" : prod.category === "Sandalye" ? "meeting chairs" : "office chairs";
  const nounTr = prod.category === "Masa" ? "çalışma masası" : prod.category === "Sandalye" ? "toplantı sandalyesi" : "ofis koltuğu";
  const reply = {
    date: nowStamp(),
    body:
      `Hello Elif,\n\nThank you for reaching out and for the catalogue. Could we get a price for ${p.sampleRequest.quantity} ${model} ${noun}? ` +
      `Delivery would be to our warehouse in ${p.city}.\n\nBest regards,\nPurchasing team\n${p.company}`,
    summary: `${p.sampleRequest.quantity} adet ${model} ${nounTr} için fiyat alabilir miyiz? Teslimat: ${p.city}.`,
  };
  return log(patch(s, id, () => ({ status: "replied", reply })), `${p.company} olumlu yanıt verdi: ${reply.summary}`, "inquiry");
}

/** Moves the prospect into customers + inquiries. Idempotent: never creates the same records twice. */
export function convertToOpportunity(s: DemoState, id: string): DemoState {
  const p = find(s, id);
  if (!p || p.status !== "replied" || !p.reply) return s;

  const existingCustomer = s.customers.find((c) => c.id === p.customerId || c.company === p.company);
  const existingInquiry = s.inquiries.find((i) => i.prospectId === p.id);
  const c = COUNTRIES[p.country];
  const prod = productOf(s, p.sampleRequest.productCode);

  const history: Customer["history"] = [
    { date: DEMO_TODAY, channel: "E-posta", summary: `Olumlu yanıt: ${p.reply.summary}` },
    { date: (p.sentAt ?? DEMO_TODAY).slice(0, 10), channel: "E-posta", summary: "İlk temas mesajı gönderildi (demo gönderimi)." },
    { date: DEMO_TODAY, channel: "E-posta", summary: "Müşteri Bulma modülünde aday olarak belirlendi." },
  ];
  const customer: Customer = existingCustomer ?? {
    id: `cus-${p.id.replace(/^pr-/, "")}`,
    company: p.company,
    country: c.tr,
    flag: c.flag,
    city: p.city,
    contact: "Satın alma ekibi",
    role: "Genel iletişim adresi",
    email: p.email,
    segment: TYPES[p.type].tr,
    history,
  };

  let inquiry: Inquiry | undefined;
  if (!existingInquiry) {
    const maxNo = Math.max(1049, ...s.inquiries.map((i) => Number(i.id.slice(4)) || 0));
    inquiry = {
      id: `TLP-${maxNo + 1}`,
      customerId: customer.id,
      receivedAt: p.reply.date,
      subject: `Price request: ${p.sampleRequest.quantity} × ${prod.code.replace("AT-", "")}`,
      messages: [
        { from: "us", date: p.sentAt ?? p.reply.date, subject: p.draft?.subject ?? "Introduction", body: p.draft?.body ?? "" },
        { from: "customer", date: p.reply.date, subject: `Re: ${p.draft?.subject ?? "Introduction"}`, body: p.reply.body },
      ],
      extracted: [
        { label: "Ürün", value: `${prod.code} ${prod.name}` },
        { label: "Miktar", value: `${p.sampleRequest.quantity} adet` },
        { label: "Ülke", value: c.tr },
        { label: "Teslimat şehri", value: p.city },
        { label: "Kaynak", value: "Müşteri Bulma · ilk temas" },
      ],
      missing: [],
      status: "new",
      request: { productCode: prod.code, quantity: p.sampleRequest.quantity, deliveryCity: p.city },
      prospectId: p.id,
    };
  }

  let n: DemoState = {
    ...s,
    customers: existingCustomer ? s.customers : [customer, ...s.customers],
    inquiries: inquiry ? [inquiry, ...s.inquiries] : s.inquiries,
  };
  n = patch(n, id, () => ({ status: "converted", customerId: customer.id, inquiryId: existingInquiry?.id ?? inquiry!.id }));
  return log(n, `${p.company} fırsata dönüştürüldü: müşteri kaydı ve ${existingInquiry?.id ?? inquiry!.id} talebi oluşturuldu.`, "inquiry");
}
