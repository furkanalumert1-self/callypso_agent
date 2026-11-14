import type { DemoState } from "./types";

export const DEMO_TODAY = "2026-11-14";
export const SCENARIO_INQUIRY = "TLP-1042";
export const SCENARIO_CUSTOMER = "cus-nordhaus";
export const SCENARIO_PRODUCT = "AT-E200";
export const SCENARIO_QTY = 200;

export const COMPANY = {
  name: "Atlas Office Furniture",
  location: "İnegöl, Bursa · Türkiye",
  user: "Elif Yıldız",
  userRole: "İhracat Müdürü",
};

export const WELCOME_TEXT =
  "Merhaba Elif. Bugün 1 yeni talep, 2 yanıtsız teklif ve 1 onay bekleyen taslak var. En öncelikli iş: Almanya'dan gelen 200 adet ofis koltuğu talebi.";

export function initialState(): DemoState {
  return {
    version: 1,
    step: 1,
    products: [
      { code: "AT-E150", name: "Ergo Basic Çalışma Koltuğu", category: "Koltuk", priceEur: 142, moq: 50, leadTimeDays: 18 },
      { code: "AT-E200", name: "Ergo Pro E200 Ergonomik Koltuk", category: "Koltuk", priceEur: 189, moq: 50, leadTimeDays: 21 },
      { code: "AT-X300", name: "Executive X300 Yönetici Koltuğu", category: "Koltuk", priceEur: 312, moq: 20, leadTimeDays: 28 },
      { code: "AT-M120", name: "Meet M120 Toplantı Sandalyesi", category: "Sandalye", priceEur: 96, moq: 100, leadTimeDays: 15 },
      { code: "AT-D160", name: "Linea D160 Çalışma Masası", category: "Masa", priceEur: 268, moq: 30, leadTimeDays: 25 },
      { code: "AT-H180", name: "Lift H180 Yükseklik Ayarlı Masa", category: "Masa", priceEur: 415, moq: 20, leadTimeDays: 30 },
      { code: "AT-S40", name: "Store S40 Çelik Dolap", category: "Depolama", priceEur: 174, moq: 40, leadTimeDays: 20 },
    ],
    customers: [
      {
        id: "cus-nordhaus", company: "Nordhaus Bürowelt GmbH", country: "Almanya", flag: "🇩🇪", city: "Hamburg",
        contact: "Jonas Becker", role: "Satın Alma Müdürü", email: "j.becker@nordhaus-buero.example", segment: "Bayi",
        history: [
          { date: "2026-11-13", channel: "E-posta", summary: "200 adet ofis koltuğu için fiyat ve termin talebi gönderdi." },
          { date: "2026-09-18", channel: "Fuar", summary: "Orgatec Köln standında tanışıldı; katalog paylaşıldı." },
        ],
      },
      {
        id: "cus-lumiere", company: "Lumière Bureau SARL", country: "Fransa", flag: "🇫🇷", city: "Lyon",
        contact: "Camille Martin", role: "Proje Yöneticisi", email: "c.martin@lumiere-bureau.example", segment: "Proje",
        history: [
          { date: "2026-11-03", channel: "E-posta", summary: "60 adet Linea D160 masa için teklif gönderildi." },
          { date: "2026-10-28", channel: "Toplantı", summary: "Online toplantıda yeni ofis projesi konuşuldu." },
        ],
      },
      {
        id: "cus-vandijk", company: "Van Dijk Office BV", country: "Hollanda", flag: "🇳🇱", city: "Rotterdam",
        contact: "Sanne de Vries", role: "Kategori Yöneticisi", email: "s.devries@vandijk-office.example", segment: "Bayi",
        history: [
          { date: "2026-11-12", channel: "E-posta", summary: "120 adet Meet M120 için takip mesajı taslağı hazırlandı." },
          { date: "2026-10-30", channel: "E-posta", summary: "Meet M120 teklifi gönderildi." },
        ],
      },
      {
        id: "cus-nordic", company: "Nordic Workspace AB", country: "İsveç", flag: "🇸🇪", city: "Göteborg",
        contact: "Erik Lindqvist", role: "Genel Müdür", email: "erik@nordicworkspace.example", segment: "Proje",
        history: [
          { date: "2026-10-21", channel: "E-posta", summary: "40 adet Lift H180 siparişi onaylandı." },
          { date: "2026-10-10", channel: "Telefon", summary: "Renk seçenekleri ve teslim süresi görüşüldü." },
        ],
      },
      {
        id: "cus-gulf", company: "Gulf Interiors LLC", country: "BAE", flag: "🇦🇪", city: "Dubai",
        contact: "Omar Haddad", role: "Satın Alma Uzmanı", email: "omar.h@gulfinteriors.example", segment: "Proje",
        history: [
          { date: "2026-11-11", channel: "E-posta", summary: "Executive X300 için numune talep etti." },
        ],
      },
    ],
    inquiries: [
      {
        id: "TLP-1042", customerId: "cus-nordhaus", receivedAt: "2026-11-13 16:42",
        subject: "Inquiry: 200 office chairs",
        messages: [
          {
            from: "customer", date: "2026-11-13 16:42", subject: "Inquiry: 200 office chairs",
            body:
              "Hello Atlas team,\n\nWe are furnishing a new office floor and are looking for 200 ergonomic office chairs. Could you please send us your best price and the expected lead time? Delivery would be to Germany, DAP.\n\nBest regards,\nJonas Becker\nNordhaus Bürowelt GmbH",
          },
        ],
        extracted: [
          { label: "Ürün", value: "Ergonomik ofis koltuğu" },
          { label: "Miktar", value: "200 adet" },
          { label: "Ülke", value: "Almanya" },
          { label: "Teslim şekli", value: "DAP" },
        ],
        missing: ["Ürün modeli", "Teslimat şehri"],
        status: "new",
      },
      {
        id: "TLP-1041", customerId: "cus-gulf", receivedAt: "2026-11-11 10:05",
        subject: "Sample request – Executive X300",
        messages: [
          {
            from: "customer", date: "2026-11-11 10:05", subject: "Sample request – Executive X300",
            body: "Dear Atlas team,\n\nWe would like to receive one sample of the Executive X300 chair in black leather before placing a project order of around 80 units.\n\nKind regards,\nOmar Haddad",
          },
        ],
        extracted: [
          { label: "Ürün", value: "AT-X300 Executive" },
          { label: "Miktar", value: "1 numune · ~80 adet proje" },
          { label: "Ülke", value: "BAE" },
          { label: "Teslimat şehri", value: "Dubai" },
        ],
        missing: [],
        status: "ready",
      },
      {
        id: "TLP-1039", customerId: "cus-lumiere", receivedAt: "2026-10-29 09:20",
        subject: "Desks for Lyon office",
        messages: [
          {
            from: "customer", date: "2026-10-29 09:20", subject: "Desks for Lyon office",
            body: "Hello,\n\nPlease quote 60 Linea D160 desks, delivered to Lyon.\n\nThank you,\nCamille Martin",
          },
        ],
        extracted: [
          { label: "Ürün", value: "AT-D160 Linea" },
          { label: "Miktar", value: "60 adet" },
          { label: "Ülke", value: "Fransa" },
          { label: "Teslimat şehri", value: "Lyon" },
        ],
        missing: [],
        status: "quoted",
      },
    ],
    quotes: [
      { id: "TKF-2031", customerId: "cus-lumiere", inquiryId: "TLP-1039", productCode: "AT-D160", quantity: 60, unitPrice: 268, status: "no_reply", createdAt: "2026-11-02", sentAt: "2026-11-03", followUpDate: "2026-11-10" },
      { id: "TKF-2029", customerId: "cus-vandijk", productCode: "AT-M120", quantity: 120, unitPrice: 96, status: "sent", createdAt: "2026-10-30", sentAt: "2026-10-30", followUpDate: "2026-11-14" },
      { id: "TKF-2024", customerId: "cus-nordic", productCode: "AT-H180", quantity: 40, unitPrice: 415, status: "accepted", createdAt: "2026-10-12", sentAt: "2026-10-12" },
      { id: "TKF-2018", customerId: "cus-gulf", productCode: "AT-S40", quantity: 50, unitPrice: 174, status: "rejected", createdAt: "2026-09-25", sentAt: "2026-09-26" },
    ],
    approvals: [
      {
        id: "ONY-301", kind: "followup", title: "Takip mesajı · Meet M120 teklifi", customerId: "cus-vandijk", refId: "TKF-2029",
        to: "s.devries@vandijk-office.example", subject: "Follow-up: Quotation TKF-2029 – Meet M120 chairs",
        body:
          "Dear Sanne,\n\nI hope you are well. I wanted to follow up on our quotation TKF-2029 for 120 Meet M120 meeting chairs (EUR 96.00 per unit).\n\nPlease let me know if you have any questions or need samples before deciding.\n\nBest regards,\nElif Yıldız\nAtlas Office Furniture",
        status: "pending", createdAt: "2026-11-12 11:30",
      },
    ],
    tasks: [
      { id: "GRV-11", title: "Lumière Bureau · TKF-2031 için takip", dueDate: "2026-11-10", quoteId: "TKF-2031", customerId: "cus-lumiere", done: false },
      { id: "GRV-12", title: "Gulf Interiors · X300 numune kargosu planla", dueDate: "2026-11-18", customerId: "cus-gulf", done: false },
    ],
    activities: [
      { id: "a3", at: "2026-11-13 16:42", text: "Nordhaus Bürowelt GmbH'den yeni talep alındı (TLP-1042).", kind: "inquiry" },
      { id: "a2", at: "2026-11-12 11:30", text: "Van Dijk Office için takip mesajı taslağı onaya gönderildi.", kind: "approval" },
      { id: "a1", at: "2026-11-11 10:05", text: "Gulf Interiors'tan X300 numune talebi alındı.", kind: "inquiry" },
    ],
    chat: [
      {
        id: "c0", role: "agent", text: WELCOME_TEXT,
        actions: [
          { label: "Yeni talepleri incele", command: "Yeni talepleri incele", primary: true },
          { label: "Yanıtsız teklifleri bul", command: "Yanıtsız teklifleri bul" },
        ],
      },
    ],
  };
}
