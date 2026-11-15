# Callypso Export Agent — UI demosu

Atlas Office Furniture örnek şirketi için ihracat operasyon paneli. Yalnızca frontend demosudur:
backend, veritabanı, LLM veya gerçek e-posta yoktur. Ajan yanıtları önceden tanımlı demo akışlarıdır.

## Çalıştırma

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Demo akışı (Ajan ekranı)

1. "Yeni talepleri incele" → "Talebi incele" (TLP-1042, Almanya, 200 koltuk) — eksikler: model, teslimat şehri
2. "Yanıt taslağı hazırla" → sağ panelden onayla (demo gönderimi)
3. "Örnek müşteri yanıtını yükle" → E200 + Hamburg
4. "Teklif hazırla" → 200 × €189 = €37.800 (TKF-2032)
5. Taslağı düzenle → "Onayla ve demo gönder" → teklif "Gönderildi", takip görevi oluşur

## Müşteri Bulma (bağlantılı senaryo)

Örnek veri — gerçek araştırma yapılmaz; 6 kurgusal aday, `.example` alan adları.

1. Müşteri Bulma → Almanya · Ofis koltuğu · Distribütör → "Örnek adayları göster"
2. Rheinwerk Büroausstattung GmbH → "Listeye ekle" → "İlk temas hazırla" (düzenlenebilir)
3. "Demo gönderimini onayla" → "Örnek olumlu yanıtı yükle" (200 × E200, Düsseldorf)
4. "Fırsata dönüştür" → müşteri + TLP-1050 talebi (tekrar oluşturulmaz)
5. "Ajanda teklif hazırla" → teklif onayı → TKF-2041 gönderildi + takip görevi

Ajan'da "Hedef pazarda müşteri araştır" seçili filtrelerle aynı sonuçları açar.

Diğer komutlar: "Yanıtsız teklifleri bul", "Takip mesajı hazırla". Veriler localStorage'da tutulur;
üst bardaki "Demoyu sıfırla" başlangıç durumuna döndürür.

## Yapı

- `src/lib/data.ts` — demo verileri
- `src/lib/agent.ts` — komut → durum geçişleri (senaryo motoru)
- `src/lib/store.tsx` — React context + localStorage
- `src/components/` — AppShell (sidebar/topbar), ortak UI, DraftEditor
- `src/app/*` — Genel Bakış, Ajan, Talepler, Müşteriler, Teklifler, Ürünler, Onaylar
