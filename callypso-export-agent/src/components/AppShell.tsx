"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Bot, CheckCircle2, FileText, Inbox, LayoutDashboard, Menu, Package, RotateCcw, Search, Users, X, CircleCheck,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import { COMPANY, DEMO_TODAY } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { cx } from "./ui";

const NAV = [
  { href: "/", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/ajan", label: "Ajan", icon: Bot },
  { href: "/talepler", label: "Talepler", icon: Inbox },
  { href: "/musteriler", label: "Müşteriler", icon: Users },
  { href: "/teklifler", label: "Teklifler", icon: FileText },
  { href: "/urunler", label: "Ürünler", icon: Package },
  { href: "/onaylar", label: "Onaylar", icon: CheckCircle2 },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const { stats } = useDemo();
  const counts: Record<string, number> = { "/talepler": stats.newInquiries, "/onaylar": stats.pendingApprovals };
  return (
    <div className="flex h-full flex-col bg-forest text-[#d7e6df]">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="grid size-9 place-items-center rounded-xl bg-emerald font-serif text-lg font-semibold text-white">C</div>
        <div className="leading-tight">
          <p className="font-serif text-[17px] font-semibold text-white">Callypso</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8fb3a5]">Export Agent</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Ana menü">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cx(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors",
                active ? "bg-emerald text-white" : "text-[#bcd3c9] hover:bg-forest-2 hover:text-white",
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {!!counts[href] && (
                <span className={cx("rounded-full px-1.5 font-mono text-[11px]", active ? "bg-white/20" : "bg-[#b88436]/25 text-[#f0d6a8]")}>{counts[href]}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-white/10 bg-forest-2/70 p-3.5">
        <p className="text-[13px] font-semibold text-white">{COMPANY.name}</p>
        <p className="mt-0.5 text-[12px] text-[#9dbcaf]">{COMPANY.location}</p>
        <div className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3">
          <div className="grid size-8 place-items-center rounded-full bg-[#2c5a4e] text-[12px] font-semibold text-white">EY</div>
          <div className="leading-tight">
            <p className="text-[13px] font-medium text-white">{COMPANY.user}</p>
            <p className="text-[11.5px] text-[#9dbcaf]">{COMPANY.userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function useOutside(ref: React.RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, close]);
}

function SearchBox() {
  const { state } = useDemo();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));

  const results = useMemo(() => {
    const t = q.trim().toLocaleLowerCase("tr");
    if (t.length < 2) return [];
    const m = (s: string) => s.toLocaleLowerCase("tr").includes(t);
    const cust = (id: string) => state.customers.find((c) => c.id === id)?.company ?? "";
    return [
      ...state.customers.filter((c) => m(c.company) || m(c.contact) || m(c.country)).map((c) => ({ k: c.id, label: c.company, meta: `Müşteri · ${c.country}`, href: `/musteriler?id=${c.id}` })),
      ...state.inquiries.filter((i) => m(i.id) || m(i.subject) || m(cust(i.customerId))).map((i) => ({ k: i.id, label: `${i.id} · ${i.subject}`, meta: "Talep", href: `/talepler?id=${i.id}` })),
      ...state.quotes.filter((x) => m(x.id) || m(cust(x.customerId)) || m(x.productCode)).map((x) => ({ k: x.id, label: `${x.id} · ${cust(x.customerId)}`, meta: "Teklif", href: "/teklifler" })),
      ...state.products.filter((p) => m(p.code) || m(p.name)).map((p) => ({ k: p.code, label: `${p.code} · ${p.name}`, meta: "Ürün", href: "/urunler" })),
    ].slice(0, 8);
  }, [q, state]);

  return (
    <div ref={ref} className="relative w-full md:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Müşteri, talep, teklif ara…"
        className="h-10 w-full rounded-xl border border-line bg-white/80 pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 focus:border-emerald/50 focus:outline-none"
        aria-label="Ara"
      />
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
          {results.length ? (
            results.map((r) => (
              <Link key={r.k} href={r.href} onClick={() => { setOpen(false); setQ(""); }} className="block px-4 py-2.5 hover:bg-tint-emerald/50">
                <p className="truncate text-sm text-ink">{r.label}</p>
                <p className="text-xs text-muted">{r.meta}</p>
              </Link>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-muted">Sonuç bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { state } = useDemo();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));
  const items = [
    ...state.approvals.filter((a) => a.status === "pending").map((a) => ({ k: a.id, text: `${a.title} onay bekliyor`, href: `/onaylar?id=${a.id}` })),
    ...state.tasks.filter((t) => !t.done && t.dueDate <= DEMO_TODAY).map((t) => ({ k: t.id, text: `${t.title} — ${formatDate(t.dueDate)}`, href: "/teklifler" })),
    ...state.inquiries.filter((i) => i.status === "new").map((i) => ({ k: i.id, text: `Yeni talep: ${i.subject}`, href: `/talepler?id=${i.id}` })),
  ];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative grid size-10 place-items-center rounded-xl border border-line bg-white/80 text-ink hover:bg-white" aria-label="Bildirimler">
        <Bell className="size-[18px]" strokeWidth={1.8} />
        {items.length > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-amber px-1 font-mono text-[10.5px] font-medium text-white">{items.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 w-[min(340px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
          <p className="border-b border-line px-4 py-3 text-sm font-semibold">Bildirimler</p>
          {items.length ? (
            items.map((n) => (
              <Link key={n.k} href={n.href} onClick={() => setOpen(false)} className="block border-b border-line/60 px-4 py-3 text-[13px] text-ink last:border-0 hover:bg-tint-emerald/50">
                {n.text}
              </Link>
            ))
          ) : (
            <p className="px-4 py-4 text-sm text-muted">Yeni bildirim yok.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { state, reset, dismissToast } = useDemo();
  const [drawer, setDrawer] = useState(false);
  const title = NAV.find((n) => isActive(path, n.href))?.label ?? "Callypso";

  useEffect(() => setDrawer(false), [path]);
  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(dismissToast, 4500);
    return () => clearTimeout(t);
  }, [state.toast, dismissToast]);

  const onReset = () => {
    if (window.confirm("Demo verileri başlangıç durumuna dönecek. Devam edilsin mi?")) reset();
  };

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#0f2a24]/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <Sidebar onNavigate={() => setDrawer(false)} />
            <button onClick={() => setDrawer(false)} className="absolute right-3 top-4 grid size-8 place-items-center rounded-lg text-white/80 hover:bg-white/10" aria-label="Menüyü kapat">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 border-b border-line bg-canvas/80 backdrop-blur-md">
          <div className="mx-auto flex h-full max-w-[1280px] items-center gap-3 px-5 lg:px-8">
            <button onClick={() => setDrawer(true)} className="grid size-10 place-items-center rounded-xl border border-line bg-white/80 lg:hidden" aria-label="Menüyü aç">
              <Menu className="size-[18px]" />
            </button>
            <h1 className="hidden font-serif text-xl font-semibold text-ink sm:block">{title}</h1>
            <span className="hidden items-center gap-1.5 rounded-full bg-tint-amber px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#8a5f1f] ring-1 ring-inset ring-[#efdcbb] sm:inline-flex">
              <span className="size-1.5 rounded-full bg-amber" /> Demo modu
            </span>
            <div className="ml-auto flex flex-1 items-center justify-end gap-2">
              <div className="hidden flex-1 justify-end md:flex">
                <SearchBox />
              </div>
              <span className="inline-flex items-center rounded-full bg-tint-amber px-2 py-1 font-mono text-[10px] font-medium uppercase text-[#8a5f1f] ring-1 ring-inset ring-[#efdcbb] sm:hidden">Demo</span>
              <button onClick={onReset} className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white/80 px-3 text-[13px] font-medium text-ink hover:bg-white" title="Demoyu sıfırla">
                <RotateCcw className="size-4" strokeWidth={1.8} />
                <span className="hidden xl:inline">Demoyu sıfırla</span>
              </button>
              <Notifications />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-5 py-6 lg:px-8 lg:py-8">
          <div className="mb-4 md:hidden">
            <SearchBox />
          </div>
          {children}
        </main>
      </div>

      {state.toast && (
        <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-5" role="status">
          <div className="flex max-w-lg items-start gap-3 rounded-2xl border border-[#c5e5d5] bg-card px-4 py-3 text-sm text-ink shadow-lg">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald" />
            <span>{state.toast}</span>
            <button onClick={dismissToast} className="text-muted hover:text-ink" aria-label="Kapat">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
