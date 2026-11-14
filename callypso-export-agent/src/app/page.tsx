"use client";

import Link from "next/link";
import { ArrowRight, Bot, CalendarClock, CheckCircle2, FileText, History, Inbox, Sparkles } from "lucide-react";
import { useDemo } from "@/lib/store";
import { customerOf, productOf, SCENARIO_STEPS } from "@/lib/agent";
import { DEMO_TODAY } from "@/lib/data";
import { eurUi, formatDate, formatStamp } from "@/lib/format";
import type { DemoState } from "@/lib/types";
import { Badge, Button, Card, CardHeader, Empty, Label, Mono, Table, Td, cx } from "@/components/ui";
import { ApprovalBadge, InquiryBadge, QuoteBadge } from "@/components/status";

function priority(s: DemoState) {
  const replyPending = s.approvals.some((a) => a.kind === "reply" && a.status === "pending");
  const map: Record<number, { title: string; detail: string; cta: string; href: string }> = {
    1: { title: "Almanya'dan 200 koltuk talebi", detail: "Nordhaus Bürowelt GmbH · TLP-1042 incelenmeyi bekliyor.", cta: "Talebi incele", href: "/ajan" },
    2: { title: "Eksik bilgiler sorulmalı", detail: "TLP-1042 için ürün modeli ve teslimat şehri eksik.", cta: "Yanıt taslağı hazırla", href: "/ajan" },
    3: replyPending
      ? { title: "Yanıt taslağı onay bekliyor", detail: "Nordhaus'a gidecek bilgi talebi e-postasını inceleyin.", cta: "Taslağı incele", href: "/ajan" }
      : { title: "Müşteri yanıtı bekleniyor", detail: "Demo için örnek müşteri yanıtını yükleyebilirsiniz.", cta: "Ajanda devam et", href: "/ajan" },
    4: { title: "Teklif hazırlanmalı", detail: "TLP-1042 bilgileri tamam: 200 × E200, teslimat Hamburg.", cta: "Teklif hazırla", href: "/ajan" },
    5: { title: "Teklif e-postası onay bekliyor", detail: "TKF-2032 · 200 × E200 · €37.800", cta: "Taslağı incele", href: "/ajan" },
    7: { title: "Yanıtsız teklifleri takip edin", detail: "Takip tarihi gelen teklifler için mesaj hazırlayın.", cta: "Ajanı aç", href: "/ajan" },
  };
  return map[s.step] ?? map[7];
}

const KPI_TONES = {
  emerald: "bg-tint-emerald text-[#17704f]",
  amber: "bg-tint-amber text-[#8a5f1f]",
  teal: "bg-tint-teal text-[#1b6b6e]",
  lime: "bg-tint-lime text-[#55702a]",
};

export default function Overview() {
  const { state, stats, toggleTask } = useDemo();
  const p = priority(state);
  const openQuotes = state.quotes.filter((q) => !["accepted", "rejected"].includes(q.status));
  const pending = state.approvals.filter((a) => a.status === "pending");
  const fresh = state.inquiries.filter((i) => i.status === "new" || i.status === "reviewing" || i.status === "awaiting_info" || i.status === "ready");
  const tasks = [...state.tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate));

  const kpis = [
    { label: "Yeni talepler", value: stats.newInquiries, hint: `${fresh.length} aktif talep`, icon: Inbox, tone: "emerald" as const, href: "/talepler" },
    { label: "Açık teklifler", value: stats.openQuotes, hint: `${eurUi(stats.pipelineEur)} potansiyel`, icon: FileText, tone: "amber" as const, href: "/teklifler" },
    { label: "Bekleyen onaylar", value: stats.pendingApprovals, hint: "İnceleme bekleyen taslak", icon: CheckCircle2, tone: "teal" as const, href: "/onaylar" },
    { label: "Takip görevleri", value: stats.openTasks, hint: `${stats.unanswered} yanıtsız teklif`, icon: CalendarClock, tone: "lime" as const, href: "/teklifler" },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-[24px] border border-line bg-gradient-to-br from-[#e5f3ea] via-[#f1f6ec] to-[#fbf3e4] p-6 sm:p-8 lg:grid-cols-[1fr_380px] lg:items-center">
        <div>
          <Label>{formatDate(DEMO_TODAY)} · Atlas Office Furniture</Label>
          <h1 className="mt-3 font-serif text-[30px] font-semibold leading-[1.15] tracking-[-0.015em] text-ink sm:text-[38px]">
            İhracat operasyonunuzun bugünkü özeti
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            {stats.newInquiries} yeni talep, {stats.pendingApprovals} onay bekleyen taslak ve {stats.unanswered} yanıtsız teklif var. Ajan, talepleri
            inceleyip yanıt ve teklif taslaklarını onayınıza hazırlar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/ajan" icon={Bot}>Ajanı aç</Button>
            <Button href="/onaylar" variant="secondary">Onayları incele</Button>
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <Badge tone="amber"><Sparkles className="size-3" /> Öncelikli görev</Badge>
            <Mono>Adım {Math.min(state.step, 7)}/7</Mono>
          </div>
          <p className="mt-4 text-[17px] font-semibold text-ink">{p.title}</p>
          <p className="mt-1 text-[13.5px] text-muted">{p.detail}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e7efe9]">
            <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${(state.step / 7) * 100}%` }} />
          </div>
          <p className="mt-2 text-[12px] text-muted">Son adım: {SCENARIO_STEPS[state.step - 1]}</p>
          <Button href={p.href} className="mt-5 w-full" icon={ArrowRight}>{p.cta}</Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="group min-w-0 rounded-[18px] border border-line bg-card p-5 shadow-card transition-colors hover:border-emerald/30">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-medium text-muted">{k.label}</p>
              <span className={cx("grid size-9 place-items-center rounded-xl", KPI_TONES[k.tone])}>
                <k.icon className="size-[18px]" strokeWidth={1.8} />
              </span>
            </div>
            <p className="mt-3 font-serif text-[34px] font-semibold leading-none text-ink">{k.value}</p>
            <p className="mt-2 text-[12.5px] text-muted">{k.hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Açık teklifler" subtitle="Onay, gönderim ve takip aşamasındaki teklifler" icon={FileText} action={<Button href="/teklifler" variant="ghost" size="sm">Tümü</Button>} />
          <Table head={["Teklif", "Müşteri", "Ürün", "Tutar", "Durum"]} minWidth={560}>
            {openQuotes.map((q) => (
              <tr key={q.id}>
                <Td><Mono className="text-ink">{q.id}</Mono></Td>
                <Td className="font-medium">{customerOf(state, q.customerId).company}</Td>
                <Td className="text-muted">{q.quantity} × {productOf(state, q.productCode).code}</Td>
                <Td className="tabular-nums">{eurUi(q.quantity * q.unitPrice)}</Td>
                <Td><QuoteBadge s={q.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card>
          <CardHeader title="Takip görevleri" subtitle="Tamamlananları işaretleyin" icon={CalendarClock} />
          <ul className="space-y-2">
            {tasks.map((t) => {
              const overdue = !t.done && t.dueDate < DEMO_TODAY;
              return (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/80 bg-white/60 p-3 hover:border-emerald/30">
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="mt-0.5 size-4 accent-[#21936b]" />
                    <span className="min-w-0 flex-1">
                      <span className={cx("block text-[13.5px]", t.done ? "text-muted line-through" : "text-ink")}>{t.title}</span>
                      <span className={cx("mt-0.5 block text-[12px]", overdue ? "text-[#a2453a]" : "text-muted")}>
                        {overdue ? "Gecikti · " : ""}{formatDate(t.dueDate)}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Talepler" subtitle="Aktif müşteri talepleri" icon={Inbox} action={<Button href="/talepler" variant="ghost" size="sm">Tümü</Button>} />
          {fresh.length ? (
            <ul className="space-y-3">
              {fresh.map((i) => (
                <li key={i.id}>
                  <Link href={`/talepler?id=${i.id}`} className="block rounded-xl border border-line/80 bg-white/60 p-3 hover:border-emerald/30">
                    <div className="flex items-center justify-between gap-2">
                      <Mono>{i.id}</Mono>
                      <InquiryBadge s={i.status} />
                    </div>
                    <p className="mt-1.5 truncate text-[13.5px] font-medium">{customerOf(state, i.customerId).company}</p>
                    <p className="truncate text-[12.5px] text-muted">{i.subject}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Aktif talep yok.</Empty>
          )}
        </Card>

        <Card>
          <CardHeader title="Bekleyen onaylar" subtitle="Gönderim öncesi kontrol" icon={CheckCircle2} action={<Button href="/onaylar" variant="ghost" size="sm">Tümü</Button>} />
          {pending.length ? (
            <ul className="space-y-3">
              {pending.map((a) => (
                <li key={a.id}>
                  <Link href={`/onaylar?id=${a.id}`} className="block rounded-xl border border-line/80 bg-white/60 p-3 hover:border-emerald/30">
                    <div className="flex items-center justify-between gap-2">
                      <Mono>{a.id}</Mono>
                      <ApprovalBadge s={a.status} />
                    </div>
                    <p className="mt-1.5 text-[13.5px] font-medium">{a.title}</p>
                    <p className="truncate text-[12.5px] text-muted">{customerOf(state, a.customerId).company}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Onay bekleyen taslak yok.</Empty>
          )}
        </Card>

        <Card>
          <CardHeader title="Son işlemler" icon={History} />
          <ol className="space-y-3.5">
            {state.activities.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald/70 ring-4 ring-tint-emerald" />
                <div className="min-w-0">
                  <p className="text-[13.5px] leading-snug text-ink">{a.text}</p>
                  <Mono>{formatStamp(a.at)}</Mono>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
