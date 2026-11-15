"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight, Bookmark, Check, Database, FileText, Handshake, Info, Mail, MailCheck, MessageSquareReply, Pencil, Search, Target,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import { COUNTRIES, describeFilters, filterProspects, GROUPS, PROSPECT_STATUS, TYPES } from "@/lib/prospects";
import { addToList, confirmSend, convertToOpportunity, loadPositiveReply, prepareContact, showProspects } from "@/lib/prospecting";
import { formatStamp } from "@/lib/format";
import type { Prospect, ProspectFilters, ProspectStatus } from "@/lib/types";
import { Badge, Button, Card, CardHeader, Empty, Label, Mono, PageIntro, cx, type Tone } from "@/components/ui";

const STATUS_TONE: Record<ProspectStatus, Tone> = {
  candidate: "gray", listed: "teal", draft: "amber", contacted: "lime", replied: "amber", converted: "emerald",
};
const ORDER: ProspectStatus[] = ["candidate", "listed", "draft", "contacted", "replied", "converted"];
const reached = (p: Prospect, s: ProspectStatus) => ORDER.indexOf(p.status) >= ORDER.indexOf(s);

function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-emerald/50 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function StepRow({ n, title, done, active, children }: { n: number; title: string; done: boolean; active: boolean; children?: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className={cx(
          "grid size-6 shrink-0 place-items-center rounded-full font-mono text-[11px]",
          done ? "bg-emerald text-white" : active ? "bg-tint-amber text-[#8a5f1f] ring-1 ring-[#efdcbb]" : "bg-[#eef2ef] text-muted",
        )}
      >
        {done ? <Check className="size-3.5" /> : n}
      </span>
      <div className="min-w-0 flex-1 pb-1">
        <p className={cx("text-[13.5px]", done || active ? "font-medium text-ink" : "text-muted")}>{title}</p>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </li>
  );
}

function OutreachEditor({ p }: { p: Prospect }) {
  const { apply } = useDemo();
  const [subject, setSubject] = useState(p.draft!.subject);
  const [body, setBody] = useState(p.draft!.body);
  const [editing, setEditing] = useState(false);
  const editable = p.status === "draft";
  return (
    <div>
      <div className="rounded-xl border border-line bg-white">
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-2 text-[12.5px] text-muted">
          <Mail className="size-3.5" /> <span className="truncate">To: {p.email}</span>
        </div>
        {editing && editable ? (
          <div className="space-y-2 p-3">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Konu" className="h-9 w-full rounded-lg border border-line px-3 text-[13.5px] font-medium focus:border-emerald/50 focus:outline-none" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={13} aria-label="İlk temas metni" className="w-full resize-y rounded-lg border border-line px-3 py-2 text-[13px] leading-relaxed focus:border-emerald/50 focus:outline-none" />
          </div>
        ) : (
          <div className="p-3.5">
            <p className="text-[13.5px] font-medium">{subject}</p>
            <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-line pr-1 text-[13px] leading-relaxed text-ink/90">{body}</p>
          </div>
        )}
      </div>
      {editable ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" icon={MailCheck} onClick={() => apply((s) => confirmSend(s, p.id, { subject, body }))}>Demo gönderimini onayla</Button>
            <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setEditing((e) => !e)}>{editing ? "Önizle" : "Düzenle"}</Button>
          </div>
          <p className="mt-2 text-[12px] text-muted">Onay, mesajı yalnızca demo olarak gönderilmiş işaretler; gerçek e-posta gönderilmez.</p>
        </>
      ) : (
        <p className="mt-2 text-[12px] text-muted">Demo gönderimi tamamlandı; gerçek e-posta gönderilmedi.{p.sentAt && ` · ${formatStamp(p.sentAt)}`}</p>
      )}
    </div>
  );
}

function Detail({ p }: { p: Prospect }) {
  const { apply, run } = useDemo();
  const router = useRouter();
  const country = COUNTRIES[p.country];
  const quoteFor = () => {
    run(`Teklif hazırla ${p.inquiryId}`);
    router.push("/ajan");
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-[21px] font-semibold leading-tight">{p.company}</h2>
          <p className="mt-1 text-[13px] text-muted">{country.flag} {p.city}, {country.tr} · {TYPES[p.type].tr}</p>
        </div>
        <Badge tone={STATUS_TONE[p.status]} dot>{PROSPECT_STATUS[p.status]}</Badge>
      </div>

      <div className="mt-4 rounded-xl border border-line/80 bg-white/60 p-3.5">
        <Label>Uygunluk gerekçesi</Label>
        <p className="mt-1 text-[13.5px] leading-snug">{p.fit}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {p.groups.map((g) => <Badge key={g} tone="lime">{GROUPS[g].tr}</Badge>)}
          <Badge><span className="font-mono">{p.email}</span></Badge>
        </div>
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold"><Search className="size-4 text-emerald" /> 1 · Aday araştırması</p>
      <ol className="mt-3 space-y-3">
        <StepRow n={1} title="Listeye ekle" done={reached(p, "listed")} active={p.status === "candidate"}>
          {p.status === "candidate" && <Button size="sm" icon={Bookmark} onClick={() => apply((s) => addToList(s, p.id))}>Listeye ekle</Button>}
        </StepRow>
      </ol>

      <p className="mt-5 flex items-center gap-1.5 border-t border-line pt-4 text-[13px] font-semibold"><Mail className="size-4 text-emerald" /> 2 · İletişim onayı</p>
      <ol className="mt-3 space-y-3">
        <StepRow n={2} title="İlk temas hazırla" done={reached(p, "draft")} active={p.status === "listed"}>
          {p.status === "listed" && <Button size="sm" icon={FileText} onClick={() => apply((s) => prepareContact(s, p.id))}>İlk temas hazırla</Button>}
        </StepRow>
        <StepRow n={3} title="Demo gönderimini onayla" done={reached(p, "contacted")} active={p.status === "draft"}>
          {p.draft && <OutreachEditor key={p.id + p.status} p={p} />}
        </StepRow>
      </ol>

      <p className="mt-5 flex items-center gap-1.5 border-t border-line pt-4 text-[13px] font-semibold"><Handshake className="size-4 text-emerald" /> 3 · Yanıt ve fırsat</p>
      <ol className="mt-3 space-y-3">
        <StepRow n={4} title="Örnek olumlu yanıtı yükle" done={reached(p, "replied")} active={p.status === "contacted"}>
          {p.status === "contacted" && (
            <Button size="sm" icon={MessageSquareReply} onClick={() => apply((s) => loadPositiveReply(s, p.id))}>Örnek olumlu yanıtı yükle</Button>
          )}
          {p.reply && (
            <div className="space-y-2">
              <div className="rounded-xl border border-line bg-white p-3.5">
                <div className="mb-1.5 flex items-center gap-2"><Badge>Müşteri yanıtı (örnek)</Badge><Mono>{formatStamp(p.reply.date)}</Mono></div>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink/90">{p.reply.body}</p>
              </div>
              <div className="rounded-xl bg-tint-amber px-3.5 py-2.5 text-[13px] text-[#6f4c18]">
                <span className="font-medium">Müşteri talebi:</span> {p.reply.summary}
              </div>
            </div>
          )}
        </StepRow>
        <StepRow n={5} title="Fırsata dönüştür" done={p.status === "converted"} active={p.status === "replied"}>
          {p.status === "replied" && (
            <>
              <Button size="sm" icon={ArrowRight} onClick={() => apply((s) => convertToOpportunity(s, p.id))}>Fırsata dönüştür</Button>
              <p className="mt-2 text-[12px] text-muted">Müşteriler ve Talepler ekranına aktarılır; kayıt bir kez oluşturulur.</p>
            </>
          )}
          {p.status === "converted" && (
            <div className="space-y-2">
              <p className="text-[13px] text-muted">
                Müşteri kaydı ve <Mono className="text-ink">{p.inquiryId}</Mono> talebi oluşturuldu. Teklif ve onay akışı mevcut ekranlardan devam eder.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={quoteFor} icon={FileText}>Ajanda teklif hazırla</Button>
                <Button size="sm" variant="secondary" href={`/talepler?id=${p.inquiryId}`}>Talebi aç</Button>
                <Button size="sm" variant="secondary" href={`/musteriler?id=${p.customerId}`}>Müşteriyi aç</Button>
              </div>
            </div>
          )}
        </StepRow>
      </ol>
    </Card>
  );
}

function Prospecting() {
  const { state, apply } = useDemo();
  const params = useSearchParams();
  const [draft, setDraft] = useState<ProspectFilters>(state.prospectFilters);
  const [sel, setSel] = useState<string | null>(params.get("id"));
  const detailRef = useRef<HTMLDivElement>(null);

  // Keep the form in sync when filters change elsewhere (agent command, demo reset).
  useEffect(() => setDraft(state.prospectFilters), [state.prospectFilters]);
  useEffect(() => {
    if (params.get("id") && !state.prospectsShown) apply((s) => ({ ...s, prospectsShown: true }));
  }, [params, state.prospectsShown, apply]);

  const linked = sel ? state.prospects.find((p) => p.id === sel) : undefined;
  const results = filterProspects(state.prospects, state.prospectFilters);
  const list = linked && !results.includes(linked) ? [linked, ...results] : results;
  const current = list.find((p) => p.id === sel) ?? list[0];

  const choose = (id: string) => {
    setSel(id);
    if (window.innerWidth < 1024) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <>
      <PageIntro
        title="Müşteri Bulma"
        description="Hedef pazarda örnek alıcı adaylarını filtreleyin, listeye ekleyin ve onaylı ilk temasla fırsata dönüştürün."
        action={<Badge tone="amber"><Database className="size-3" /> Örnek veri — gerçek araştırma yapılmaz</Badge>}
      />

      <Card>
        <CardHeader title="Hedef pazar" subtitle="Filtreler 6 kurgusal adaydan oluşan örnek liste üzerinde çalışır" icon={Target} />
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setSel(null);
            apply((s) => showProspects(s, draft));
          }}
        >
          <Select
            label="Hedef ülke"
            value={draft.country}
            onChange={(v) => setDraft({ ...draft, country: v })}
            options={[{ value: "all", label: "Tümü" }, ...(["DE", "NL", "FR"] as const).map((k) => ({ value: k, label: COUNTRIES[k].tr }))]}
          />
          <Select
            label="Ürün grubu"
            value={draft.group}
            onChange={(v) => setDraft({ ...draft, group: v })}
            options={[{ value: "all", label: "Tümü" }, ...(["chair", "desk"] as const).map((k) => ({ value: k, label: GROUPS[k].tr }))]}
          />
          <Select
            label="Müşteri tipi"
            value={draft.type}
            onChange={(v) => setDraft({ ...draft, type: v })}
            options={[{ value: "all", label: "Tümü" }, ...(["distributor", "importer", "retailer"] as const).map((k) => ({ value: k, label: TYPES[k].tr }))]}
          />
          <Button type="submit" icon={Search} className="sm:col-span-2 lg:col-span-1">Örnek adayları göster</Button>
        </form>
      </Card>

      {!state.prospectsShown ? (
        <div className="mt-6"><Empty>Filtreleri seçip “Örnek adayları göster” ile demo sonuçlarını açın.</Empty></div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <Card pad={false} className="h-fit overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <p className="text-[15px] font-semibold">{results.length} örnek aday</p>
                <p className="text-[12.5px] text-muted">{describeFilters(state.prospectFilters)}</p>
              </div>
              <Mono>Listede: {state.prospects.filter((p) => p.status !== "candidate").length}</Mono>
            </div>
            {list.length ? (
              <ul className="divide-y divide-line">
                {list.map((p) => {
                  const c = COUNTRIES[p.country];
                  return (
                    <li key={p.id}>
                      <button onClick={() => choose(p.id)} className={cx("w-full px-5 py-4 text-left transition-colors sm:px-6", current?.id === p.id ? "bg-tint-emerald/60" : "hover:bg-tint-emerald/30")}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14.5px] font-medium">{p.company}</p>
                            <p className="mt-0.5 text-[12.5px] text-muted">{c.flag} {c.tr} · {p.city}</p>
                          </div>
                          <Badge tone={STATUS_TONE[p.status]} dot>{PROSPECT_STATUS[p.status]}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge tone="teal">{TYPES[p.type].tr}</Badge>
                          {p.groups.map((g) => <Badge key={g} tone="lime">{GROUPS[g].tr}</Badge>)}
                        </div>
                        <p className="mt-2 text-[13px] leading-snug text-ink/80">{p.fit}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-5"><Empty>Bu filtrelerle eşleşen örnek aday yok. Farklı bir ülke veya müşteri tipi deneyin.</Empty></div>
            )}
            <p className="flex items-center gap-1.5 border-t border-line px-5 py-3 text-[12px] text-muted sm:px-6">
              <Info className="size-3.5 shrink-0" /> Firmalar kurgusaldır; iletişim adresleri .example alan adı kullanır.
            </p>
          </Card>

          <div ref={detailRef} className="scroll-mt-24">
            {current ? <Detail key={current.id} p={current} /> : <Card><Empty>Ayrıntılar için bir aday seçin.</Empty></Card>}
            {current?.status === "converted" && (
              <p className="mt-3 text-center text-[12.5px] text-muted">
                Teklif durumu için <Link href="/teklifler" className="text-emerald underline-offset-2 hover:underline">Teklifler</Link> ekranına bakın.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Prospecting />
    </Suspense>
  );
}
