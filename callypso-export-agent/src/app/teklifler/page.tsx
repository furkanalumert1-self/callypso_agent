"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { useDemo } from "@/lib/store";
import { customerOf, isUnanswered, productOf } from "@/lib/agent";
import { DEMO_TODAY } from "@/lib/data";
import { eurUi, eurUiCents, formatDate } from "@/lib/format";
import type { QuoteStatus } from "@/lib/types";
import { Badge, Card, CardHeader, Empty, Mono, PageIntro, Table, Tabs, Td, cx } from "@/components/ui";
import { QuoteBadge } from "@/components/status";

type Filter = "all" | "open" | "unanswered" | "closed";
const CLOSED: QuoteStatus[] = ["accepted", "rejected"];

export default function Quotes() {
  const { state, toggleTask } = useDemo();
  const [f, setF] = useState<Filter>("all");
  const list = state.quotes.filter((q) =>
    f === "all" ? true : f === "open" ? !CLOSED.includes(q.status) : f === "closed" ? CLOSED.includes(q.status) : isUnanswered(q),
  );

  return (
    <>
      <PageIntro title="Teklifler" description="Müşteri, ürün, miktar, fiyat, durum ve takip tarihleri. Tutarlar EUR." />
      <Card>
        <Tabs
          value={f}
          onChange={setF}
          items={[
            { value: "all", label: "Tümü", count: state.quotes.length },
            { value: "open", label: "Açık", count: state.quotes.filter((q) => !CLOSED.includes(q.status)).length },
            { value: "unanswered", label: "Yanıtsız", count: state.quotes.filter(isUnanswered).length },
            { value: "closed", label: "Kapanan", count: state.quotes.filter((q) => CLOSED.includes(q.status)).length },
          ]}
        />
        {list.length ? (
          <Table head={["Teklif", "Müşteri", "Ürün", "Miktar", "Birim fiyat", "Toplam", "Durum", "Takip tarihi"]} minWidth={900}>
            {list.map((q) => {
              const p = productOf(state, q.productCode);
              const c = customerOf(state, q.customerId);
              const due = q.followUpDate && !CLOSED.includes(q.status);
              return (
                <tr key={q.id} className="hover:bg-tint-emerald/20">
                  <Td><Mono className="text-ink">{q.id}</Mono></Td>
                  <Td><span className="font-medium">{c.company}</span><span className="block text-[12px] text-muted">{c.flag} {c.country}</span></Td>
                  <Td><span className="font-mono text-[12px]">{p.code}</span><span className="block text-[12px] text-muted">{p.name}</span></Td>
                  <Td className="tabular-nums">{q.quantity}</Td>
                  <Td className="tabular-nums">{eurUiCents(q.unitPrice)}</Td>
                  <Td className="font-medium tabular-nums">{eurUi(q.unitPrice * q.quantity)}</Td>
                  <Td><QuoteBadge s={q.status} /></Td>
                  <Td>
                    {due ? (
                      <span className={cx("text-[13px]", q.followUpDate! <= DEMO_TODAY ? "font-medium text-[#a2453a]" : "text-ink")}>{formatDate(q.followUpDate!)}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <Empty>Bu filtrede teklif yok.</Empty>
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader title="Takip görevleri" subtitle="Ajanın oluşturduğu ve elle eklenen takipler" icon={CalendarClock} />
        <ul className="grid gap-3 md:grid-cols-2">
          {state.tasks.map((t) => (
            <li key={t.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/80 bg-white/60 p-3.5 hover:border-emerald/30">
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="mt-0.5 size-4 accent-[#21936b]" />
                <span className="min-w-0 flex-1">
                  <span className={cx("block text-[13.5px]", t.done && "text-muted line-through")}>{t.title}</span>
                  <span className="mt-1 flex items-center gap-2"><Mono>{t.id}</Mono><span className="text-[12px] text-muted">{formatDate(t.dueDate)}</span></span>
                </span>
                {t.done ? <Badge tone="emerald">Tamamlandı</Badge> : t.dueDate < DEMO_TODAY ? <Badge tone="red">Gecikti</Badge> : <Badge tone="teal">Planlandı</Badge>}
              </label>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
