"use client";

import { useDemo } from "@/lib/store";
import { eurUiCents } from "@/lib/format";
import { Badge, Card, Mono, PageIntro, Table, Td } from "@/components/ui";

export default function Products() {
  const { state } = useDemo();
  return (
    <>
      <PageIntro title="Ürünler" description="Teklif hesaplamalarında kullanılan örnek katalog. Fiyatlar EXW birim fiyatıdır (EUR)." />
      <Card>
        <Table head={["Kod", "Ürün adı", "Kategori", "EUR fiyat", "Minimum sipariş", "Üretim süresi"]} minWidth={760}>
          {state.products.map((p) => (
            <tr key={p.code} className="hover:bg-tint-emerald/20">
              <Td><Mono className="text-ink">{p.code}</Mono></Td>
              <Td className="font-medium">{p.name}</Td>
              <Td><Badge tone={p.category === "Koltuk" ? "emerald" : p.category === "Masa" ? "amber" : p.category === "Sandalye" ? "teal" : "lime"}>{p.category}</Badge></Td>
              <Td className="tabular-nums">{eurUiCents(p.priceEur)}</Td>
              <Td className="tabular-nums">{p.moq} adet</Td>
              <Td className="tabular-nums">{p.leadTimeDays} gün</Td>
            </tr>
          ))}
        </Table>
        <p className="mt-4 text-[12.5px] text-muted">Katalog düzenleme ve ERP senkronizasyonu bu demonun kapsamı dışındadır.</p>
      </Card>
    </>
  );
}
