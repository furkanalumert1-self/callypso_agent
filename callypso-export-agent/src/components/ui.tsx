import type { LucideIcon } from "lucide-react";
import Link from "next/link";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");
export { cx };

export function Card({ className, children, pad = true }: { className?: string; children: React.ReactNode; pad?: boolean }) {
  return (
    <section className={cx("min-w-0 rounded-[18px] border border-line bg-card shadow-card", pad && "p-5 sm:p-6", className)}>{children}</section>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }: { title: string; subtitle?: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && <Icon className="mt-0.5 size-[18px] shrink-0 text-emerald" strokeWidth={1.8} />}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

type BtnProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit";
  className?: string;
};

export function Button({ children, variant = "primary", size = "md", icon: Icon, href, onClick, disabled, title, type = "button", className }: BtnProps) {
  const cls = cx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "md" ? "h-10 px-4 text-sm" : "h-8 px-3 text-[13px]",
    variant === "primary" && "bg-emerald text-white hover:bg-emerald-dark",
    variant === "secondary" && "border border-line bg-white text-ink hover:border-emerald/40 hover:bg-tint-emerald/40",
    variant === "ghost" && "text-muted hover:bg-tint-emerald/60 hover:text-ink",
    variant === "danger" && "border border-line bg-white text-[#a2453a] hover:border-[#e4bdb6] hover:bg-[#fbefed]",
    className,
  );
  const inner = (
    <>
      {Icon && <Icon className={size === "md" ? "size-4" : "size-3.5"} strokeWidth={2} />}
      {children}
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls} title={title}>
        {inner}
      </Link>
    );
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} title={title}>
      {inner}
    </button>
  );
}

const tones = {
  emerald: "bg-tint-emerald text-[#17704f] ring-[#c5e5d5]",
  amber: "bg-tint-amber text-[#8a5f1f] ring-[#efdcbb]",
  teal: "bg-tint-teal text-[#1b6b6e] ring-[#c3e3e4]",
  lime: "bg-tint-lime text-[#55702a] ring-[#dbe8bf]",
  gray: "bg-[#eef2ef] text-[#5c6b64] ring-[#dde5df]",
  red: "bg-[#fbefed] text-[#a2453a] ring-[#f0d3ce]",
} as const;
export type Tone = keyof typeof tones;

export function Badge({ tone = "gray", children, dot }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cx("font-mono text-[11.5px] tracking-tight text-muted", className)}>{children}</span>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">{children}</p>;
}

export function PageIntro({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[14.5px] text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Table({ head, children, minWidth = 720 }: { head: string[]; children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="scroll-x -mx-5 sm:-mx-6">
      <table className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line">
            {head.map((h, i) => (
              <th key={i} className="px-5 pb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted first:pl-5 sm:px-6">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/80">{children}</tbody>
      </table>
    </div>
  );
}

export const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={cx("px-5 py-3.5 align-middle sm:px-6", className)}>{children}</td>
);

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="scroll-x mb-4 flex gap-1 rounded-xl border border-line bg-white p-1">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cx(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
            value === it.value ? "bg-tint-emerald text-[#17704f]" : "text-muted hover:text-ink",
          )}
        >
          {it.label}
          {it.count !== undefined && <span className="font-mono text-[11px] opacity-70">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{children}</p>;
}
