"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Check, MessageSquare, ScanText, TriangleAlert } from "lucide-react";
import { useDemo } from "@/lib/store";
import { customerOf } from "@/lib/agent";
import { formatStamp } from "@/lib/format";
import { Badge, Button, Card, CardHeader, Label, Mono, PageIntro, cx } from "@/components/ui";
import { InquiryBadge } from "@/components/status";

function Inquiries() {
  const { state, run } = useDemo();
  const router = useRouter();
  const params = useSearchParams();
  const [sel, setSel] = useState(params.get("id") ?? state.inquiries[0].id);
  const inq = state.inquiries.find((i) => i.id === sel) ?? state.inquiries[0];
  const c = customerOf(state, inq.customerId);

  return (
    <>
      <PageIntro title="Talepler" description="Gelen müşteri mesajları, ajanın çıkardığı bilgiler ve teklif öncesi eksikler." />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card pad={false} className="h-fit overflow-hidden">
          <ul className="divide-y divide-line">
            {state.inquiries.map((i) => {
              const cu = customerOf(state, i.customerId);
              return (
                <li key={i.id}>
                  <button
                    onClick={() => setSel(i.id)}
                    className={cx("w-full px-5 py-4 text-left transition-colors", i.id === inq.id ? "bg-tint-emerald/60" : "hover:bg-tint-emerald/30")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Mono>{i.id}</Mono>
                      <InquiryBadge s={i.status} />
                    </div>
                    <p className="mt-1.5 text-[14px] font-medium">{cu.flag} {cu.company}</p>
                    <p className="truncate text-[12.5px] text-muted">{i.subject}</p>
                    <p className="mt-1 text-[11.5px] text-muted">{formatStamp(i.receivedAt)}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title={inq.subject}
              subtitle={`${c.company} · ${c.contact} · ${c.city}, ${c.country}`}
              icon={MessageSquare}
              action={<InquiryBadge s={inq.status} />}
            />
            <div className="space-y-3">
              {inq.messages.map((m, idx) => (
                <div key={idx} className={cx("rounded-xl border p-4", m.from === "customer" ? "border-line bg-white" : "border-[#c5e5d5] bg-tint-emerald/40")}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge tone={m.from === "customer" ? "gray" : "emerald"}>{m.from === "customer" ? "Müşteri" : "Atlas (demo gönderimi)"}</Badge>
                    <Mono>{formatStamp(m.date)}</Mono>
                  </div>
                  <p className="text-[13.5px] font-medium">{m.subject}</p>
                  <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed text-ink/90">{m.body}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader title="Çıkarılan bilgiler" icon={ScanText} />
              <dl className="space-y-2.5">
                {inq.extracted.map((e) => (
                  <div key={e.label} className="flex justify-between gap-4 border-b border-line/70 pb-2.5 last:border-0 last:pb-0">
                    <dt className="text-[13px] text-muted">{e.label}</dt>
                    <dd className="text-right text-[13.5px] font-medium">{e.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Card>
              <CardHeader title="Eksikler" icon={TriangleAlert} />
              {inq.missing.length ? (
                <ul className="space-y-2">
                  {inq.missing.map((m) => (
                    <li key={m} className="flex items-center gap-2 rounded-xl bg-tint-amber px-3 py-2.5 text-[13.5px] text-[#8a5f1f]">
                      <TriangleAlert className="size-4" /> {m}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-center gap-2 rounded-xl bg-tint-emerald px-3 py-2.5 text-[13.5px] text-[#17704f]">
                  <Check className="size-4" /> Eksik bilgi yok
                </p>
              )}
              {inq.id === "TLP-1042" && inq.status !== "quoted" && (
                <Button href="/ajan" icon={Bot} className="mt-4 w-full">Ajanda devam et</Button>
              )}
              {inq.prospectId && (() => {
                const quote = state.quotes.find((q) => q.inquiryId === inq.id && q.status !== "draft");
                return quote ? (
                  <p className="mt-4 text-[12.5px] text-muted">Teklif: <Mono className="text-ink">{quote.id}</Mono> · Teklifler ve Onaylar ekranından izlenir.</p>
                ) : (
                  <Button className="mt-4 w-full" icon={Bot} onClick={() => { run(`Teklif hazırla ${inq.id}`); router.push("/ajan"); }}>Ajanda teklif hazırla</Button>
                );
              })()}
              {inq.prospectId && (
                <p className="mt-2 text-[12px] text-muted">Kaynak: Müşteri Bulma · ilk temas yazışması</p>
              )}
              {inq.id !== "TLP-1042" && !inq.prospectId && (
                <div className="mt-4">
                  <Label>Not</Label>
                  <p className="mt-1 text-[12.5px] text-muted">Bu talep demo senaryosunun dışında; yalnızca örnek olarak listelenir.</p>
                </div>
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
      <Inquiries />
    </Suspense>
  );
}
