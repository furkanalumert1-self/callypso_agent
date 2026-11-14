"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, History, Mail, MapPin, UserRound } from "lucide-react";
import { useDemo } from "@/lib/store";
import { eurUi, formatDate } from "@/lib/format";
import { Badge, Card, CardHeader, Label, Mono, PageIntro, cx } from "@/components/ui";
import { QuoteBadge } from "@/components/status";

function Customers() {
  const { state } = useDemo();
  const params = useSearchParams();
  const [sel, setSel] = useState(params.get("id") ?? state.customers[0].id);
  const c = state.customers.find((x) => x.id === sel) ?? state.customers[0];
  const quotes = state.quotes.filter((q) => q.customerId === c.id);

  return (
    <>
      <PageIntro title="Müşteriler" description="İthalatçı ve bayi şirketler, ilgili kişiler ve iletişim geçmişi." />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card pad={false} className="h-fit overflow-hidden">
          <ul className="divide-y divide-line">
            {state.customers.map((x) => (
              <li key={x.id}>
                <button onClick={() => setSel(x.id)} className={cx("flex w-full items-center gap-3 px-5 py-4 text-left transition-colors", x.id === c.id ? "bg-tint-emerald/60" : "hover:bg-tint-emerald/30")}>
                  <span className="text-xl" aria-hidden>{x.flag}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{x.company}</span>
                    <span className="block text-[12.5px] text-muted">{x.country} · {x.contact}</span>
                  </span>
                  <Badge tone={x.segment === "Bayi" ? "teal" : "lime"}>{x.segment}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-start gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-tint-emerald text-2xl">{c.flag}</div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-[22px] font-semibold leading-tight">{c.company}</h2>
                <p className="mt-0.5 text-[13px] text-muted">{c.segment} müşteri</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { icon: MapPin, label: "Ülke / şehir", value: `${c.country} · ${c.city}` },
                { icon: UserRound, label: "İlgili kişi", value: `${c.contact} — ${c.role}` },
                { icon: Mail, label: "E-posta", value: c.email },
              ].map((r) => (
                <div key={r.label} className="rounded-xl border border-line/80 bg-white/60 p-3.5">
                  <dt className="flex items-center gap-1.5 text-[12px] text-muted"><r.icon className="size-3.5" /> {r.label}</dt>
                  <dd className="mt-1 break-words text-[13.5px] font-medium">{r.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader title="İletişim geçmişi" icon={History} />
              <ol className="space-y-4">
                {c.history.map((h, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald/70 ring-4 ring-tint-emerald" />
                    <div>
                      <div className="flex items-center gap-2"><Mono>{formatDate(h.date)}</Mono><Badge>{h.channel}</Badge></div>
                      <p className="mt-1 text-[13.5px] leading-snug">{h.summary}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
            <Card>
              <CardHeader title="Teklifler" icon={Building2} />
              {quotes.length ? (
                <ul className="space-y-2.5">
                  {quotes.map((q) => (
                    <li key={q.id} className="flex items-center justify-between gap-3 rounded-xl border border-line/80 bg-white/60 p-3">
                      <div>
                        <Mono className="text-ink">{q.id}</Mono>
                        <p className="text-[13px] text-muted">{q.quantity} × {q.productCode} · {eurUi(q.quantity * q.unitPrice)}</p>
                      </div>
                      <QuoteBadge s={q.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div><Label>Kayıt yok</Label><p className="mt-1 text-[13px] text-muted">Bu müşteri için henüz teklif yok.</p></div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Customers />
    </Suspense>
  );
}
