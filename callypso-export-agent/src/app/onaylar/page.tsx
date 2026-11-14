"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDemo } from "@/lib/store";
import { customerOf } from "@/lib/agent";
import { formatStamp } from "@/lib/format";
import type { ApprovalStatus } from "@/lib/types";
import { Card, Empty, Mono, PageIntro, Tabs, cx } from "@/components/ui";
import { ApprovalBadge, kindLabel } from "@/components/status";
import { DraftEditor } from "@/components/DraftEditor";

function Approvals() {
  const { state } = useDemo();
  const params = useSearchParams();
  const [sel, setSel] = useState<string | null>(params.get("id"));
  const [tab, setTab] = useState<ApprovalStatus>(() => state.approvals.find((a) => a.id === sel)?.status ?? "pending");
  const list = state.approvals.filter((a) => a.status === tab);
  const current = state.approvals.find((a) => a.id === sel && a.status === tab) ?? list[0];
  const count = (s: ApprovalStatus) => state.approvals.filter((a) => a.status === s).length;

  return (
    <>
      <PageIntro title="Onaylar" description="Ajanın hazırladığı taslakları gönderimden önce inceleyin, düzenleyin, onaylayın veya reddedin." />
      <Tabs
        value={tab}
        onChange={(v) => setTab(v)}
        items={[
          { value: "pending", label: "Bekleyen", count: count("pending") },
          { value: "approved", label: "Onaylanan", count: count("approved") },
          { value: "rejected", label: "Reddedilen", count: count("rejected") },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card pad={false} className="h-fit overflow-hidden">
          {list.length ? (
            <ul className="divide-y divide-line">
              {list.map((a) => (
                <li key={a.id}>
                  <button onClick={() => setSel(a.id)} className={cx("w-full px-5 py-4 text-left transition-colors", current?.id === a.id ? "bg-tint-emerald/60" : "hover:bg-tint-emerald/30")}>
                    <div className="flex items-center justify-between gap-2">
                      <Mono>{a.id}</Mono>
                      <ApprovalBadge s={a.status} />
                    </div>
                    <p className="mt-1.5 text-[14px] font-medium">{a.title}</p>
                    <p className="text-[12.5px] text-muted">{customerOf(state, a.customerId).company} · {kindLabel[a.kind]}</p>
                    <p className="mt-1 text-[11.5px] text-muted">{formatStamp(a.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5"><Empty>Bu sekmede kayıt yok.</Empty></div>
          )}
        </Card>
        <Card>
          {current ? <DraftEditor key={current.id + current.status} approval={current} /> : <Empty>İncelemek için bir taslak seçin.</Empty>}
        </Card>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Approvals />
    </Suspense>
  );
}
