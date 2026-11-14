"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Check, ClipboardList, FileText, Info, ListChecks, Send, TriangleAlert } from "lucide-react";
import { useDemo } from "@/lib/store";
import { customerOf, QUICK_COMMANDS, SCENARIO_STEPS } from "@/lib/agent";
import { SCENARIO_INQUIRY } from "@/lib/data";
import { Badge, Button, Card, CardHeader, Empty, Label, Mono, cx } from "@/components/ui";
import { InquiryBadge } from "@/components/status";
import { DraftEditor } from "@/components/DraftEditor";

export default function AgentPage() {
  const { state, run } = useDemo();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [state.chat.length]);

  const inquiry = state.inquiries.find((i) => i.id === SCENARIO_INQUIRY)!;
  const customer = customerOf(state, inquiry.customerId);
  const draft =
    state.approvals.find((a) => a.id === state.focusApprovalId && a.status === "pending") ?? state.approvals.find((a) => a.status === "pending");
  const lastAgent = [...state.chat].reverse().find((m) => m.role === "agent");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    run(input);
    setInput("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Chat */}
      <Card pad={false} className="flex min-h-[560px] flex-col lg:h-[calc(100vh-128px)]">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="grid size-10 place-items-center rounded-xl bg-tint-emerald text-emerald">
            <Bot className="size-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[18px] font-semibold leading-tight">İhracat Ajanı</p>
            <p className="text-[12.5px] text-muted">Talepleri inceler, yanıt ve teklif taslaklarını onayınıza hazırlar.</p>
          </div>
          <Badge tone="amber">Demo akışı</Badge>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {state.chat.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-forest px-4 py-2.5 text-[14px] text-white">{m.text}</p>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-tint-emerald text-emerald">
                  <Bot className="size-4" strokeWidth={1.8} />
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3">
                  <p className="text-[14px] leading-relaxed text-ink">{m.text}</p>
                  {m.bullets && (
                    <ul className="mt-2 space-y-1">
                      {m.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-[13.5px] text-ink/90">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-emerald" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {m.note && <p className="mt-2 text-[12.5px] text-muted">{m.note}</p>}
                  {m.actions && m.actions.length > 0 && m === lastAgent && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.actions.map((a) => (
                        <Button key={a.command} size="sm" variant={a.primary ? "primary" : "secondary"} onClick={() => run(a.command)}>
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        <div className="border-t border-line px-5 py-4 sm:px-6">
          <Label>Örnek komutlar</Label>
          <div className="scroll-x mt-2 flex gap-2 pb-1">
            {QUICK_COMMANDS.map((c) => (
              <button
                key={c}
                onClick={() => run(c)}
                className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink hover:border-emerald/40 hover:bg-tint-emerald/50"
              >
                {c}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir komut yazın, ör. “Teklif hazırla”"
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-4 text-sm focus:border-emerald/50 focus:outline-none"
              aria-label="Komut"
            />
            <Button type="submit" icon={Send} className="h-11">
              <span className="hidden sm:inline">Gönder</span>
            </Button>
          </form>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
            <Info className="size-3.5" /> Gerçek yapay zekâ bağlı değildir; yanıtlar demo senaryosuna göre önceden tanımlıdır.
          </p>
        </div>
      </Card>

      {/* Side panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader title="Görev detayları" icon={ClipboardList} action={<InquiryBadge s={inquiry.status} />} />
          <div className="flex items-center gap-2">
            <Mono>{inquiry.id}</Mono>
            <span className="text-[12.5px] text-muted">· {inquiry.subject}</span>
          </div>
          <p className="mt-2 text-[14px] font-semibold">
            {customer.flag} {customer.company}
          </p>
          <p className="text-[12.5px] text-muted">
            {customer.contact} · {customer.role}
          </p>
          {state.step >= 2 ? (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5">
                {inquiry.extracted.map((e) => (
                  <div key={e.label}>
                    <dt className="text-[11.5px] text-muted">{e.label}</dt>
                    <dd className="text-[13.5px] font-medium">{e.value}</dd>
                  </div>
                ))}
              </dl>
              {inquiry.missing.length > 0 ? (
                <div className="mt-4 rounded-xl bg-tint-amber px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#8a5f1f]">
                    <TriangleAlert className="size-4" /> Eksik bilgiler
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {inquiry.missing.map((m) => (
                      <Badge key={m} tone="amber">{m}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-tint-emerald px-3.5 py-3 text-[13px] font-medium text-[#17704f]">
                  <Check className="size-4" /> Teklif için gerekli bilgiler tamam
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 text-[13px] text-muted">Talep henüz incelenmedi. Sohbette “Talebi incele” ile başlayın.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="İşlem adımları" icon={ListChecks} action={<Mono>{state.step}/7</Mono>} />
          <ol className="space-y-2">
            {SCENARIO_STEPS.map((s, i) => {
              const n = i + 1;
              const done = state.step >= 7 ? true : n <= state.step;
              const current = !done && n === state.step + 1;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span
                    className={cx(
                      "grid size-6 shrink-0 place-items-center rounded-full font-mono text-[11px]",
                      done ? "bg-emerald text-white" : current ? "bg-tint-amber text-[#8a5f1f] ring-1 ring-[#efdcbb]" : "bg-[#eef2ef] text-muted",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : n}
                  </span>
                  <span className={cx("text-[13.5px]", done ? "text-ink" : current ? "font-medium text-ink" : "text-muted")}>{s}</span>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card>
          <CardHeader title="Hazırlanan taslak" subtitle="İnceleyin, düzenleyin ve onaylayın" icon={FileText} />
          {draft ? <DraftEditor key={draft.id} approval={draft} compact /> : <Empty>Onay bekleyen taslak yok. Ajan bir taslak hazırladığında burada görünür.</Empty>}
        </Card>
      </div>
    </div>
  );
}
