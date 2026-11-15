/** Fictional prospect data for the "Müşteri Bulma" demo. No real companies, people or contacts. */
import type { CountryKey, ProductGroup, Prospect, ProspectFilters, ProspectStatus, ProspectType } from "./types";

export const COUNTRIES: Record<CountryKey, { tr: string; en: string; flag: string }> = {
  DE: { tr: "Almanya", en: "Germany", flag: "🇩🇪" },
  NL: { tr: "Hollanda", en: "the Netherlands", flag: "🇳🇱" },
  FR: { tr: "Fransa", en: "France", flag: "🇫🇷" },
};

export const GROUPS: Record<ProductGroup, { tr: string; en: string }> = {
  chair: { tr: "Ofis koltuğu", en: "office chairs" },
  desk: { tr: "Çalışma masası", en: "office desks" },
};

export const TYPES: Record<ProspectType, { tr: string; en: string }> = {
  distributor: { tr: "Distribütör", en: "distributor" },
  importer: { tr: "İthalatçı", en: "importer" },
  retailer: { tr: "Perakendeci", en: "retailer" },
};

export const PROSPECT_STATUS: Record<ProspectStatus, string> = {
  candidate: "Aday",
  listed: "Listede",
  draft: "Taslak hazır",
  contacted: "Temas kuruldu (demo)",
  replied: "Olumlu yanıt",
  converted: "Fırsata dönüştü",
};

/** The prospect used by the linked walkthrough. */
export const SCENARIO_PROSPECT = "pr-rheinwerk";

export function initialProspects(): Prospect[] {
  return [
    {
      id: "pr-rheinwerk", company: "Rheinwerk Büroausstattung GmbH", country: "DE", city: "Düsseldorf", type: "distributor",
      groups: ["chair", "desk"], email: "purchasing@rheinwerk-buero.example",
      fit: "Kuzey Ren-Vestfalya'da bayi ağı olan proje distribütörü; ergonomik orta segment koltuk portföyü E200 ile örtüşüyor.",
      sampleRequest: { productCode: "AT-E200", quantity: 200 }, status: "candidate",
    },
    {
      id: "pr-elbe", company: "Elbe Objektmöbel Handels GmbH", country: "DE", city: "Leipzig", type: "importer",
      groups: ["chair"], email: "sourcing@elbe-objektmoebel.example",
      fit: "Doğrudan ithalat yapıyor, konteyner bazlı alım; uygun fiyatlı E150 serisi için hacim potansiyeli.",
      sampleRequest: { productCode: "AT-E150", quantity: 300 }, status: "candidate",
    },
    {
      id: "pr-suedstern", company: "Bürohaus Südstern KG", country: "DE", city: "Münih", type: "retailer",
      groups: ["chair", "desk"], email: "einkauf@buerohaus-suedstern.example",
      fit: "KOBİ'lere satış yapan mağaza zinciri; yükseklik ayarlı masa ve koltuk setlerine talep var.",
      sampleRequest: { productCode: "AT-D160", quantity: 40 }, status: "candidate",
    },
    {
      id: "pr-kanaal", company: "Kanaal Kantoorinrichting BV", country: "NL", city: "Utrecht", type: "distributor",
      groups: ["chair", "desk"], email: "inkoop@kanaal-kantoor.example",
      fit: "Benelux'ta ofis projeleri yürüten distribütör; masa + koltuk paket teklifleriyle çalışıyor.",
      sampleRequest: { productCode: "AT-E200", quantity: 120 }, status: "candidate",
    },
    {
      id: "pr-polder", company: "Polder Office Import BV", country: "NL", city: "Eindhoven", type: "importer",
      groups: ["desk"], email: "import@polder-office.example",
      fit: "Avrupa dışından masa ithal ediyor; Lift H180 için Rotterdam limanı üzerinden kısa lojistik.",
      sampleRequest: { productCode: "AT-H180", quantity: 60 }, status: "candidate",
    },
    {
      id: "pr-rive", company: "Atelier Bureau Rive SAS", country: "FR", city: "Nantes", type: "retailer",
      groups: ["chair"], email: "achats@atelier-bureau-rive.example",
      fit: "Yönetici ofisi mobilyası satan butik perakendeci; X300 segmentine uygun müşteri profili.",
      sampleRequest: { productCode: "AT-X300", quantity: 25 }, status: "candidate",
    },
  ];
}

export function filterProspects(list: Prospect[], f: ProspectFilters) {
  return list.filter(
    (p) => (f.country === "all" || p.country === f.country) && (f.group === "all" || p.groups.includes(f.group)) && (f.type === "all" || p.type === f.type),
  );
}

export function describeFilters(f: ProspectFilters) {
  return [
    f.country === "all" ? "Tüm ülkeler" : COUNTRIES[f.country].tr,
    f.group === "all" ? "Tüm ürün grupları" : GROUPS[f.group].tr,
    f.type === "all" ? "Tüm müşteri tipleri" : TYPES[f.type].tr,
  ].join(" · ");
}
