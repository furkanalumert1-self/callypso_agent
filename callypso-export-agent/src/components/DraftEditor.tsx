"use client";

import { useState } from "react";
import { Ban, Check, Mail, Pencil } from "lucide-react";
import type { Approval } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { Button, Mono } from "./ui";
import { ApprovalBadge, kindLabel } from "./status";
import { formatStamp } from "@/lib/format";

/** Review / edit / approve / reject a draft. Mount with key={approval.id}. */
export function DraftEditor({ approval, compact }: { approval: Approval; compact?: boolean }) {
  const { approve, reject } = useDemo();
  const [subject, setSubject] = useState(approval.subject);
  const [body, setBody] = useState(approval.body);
  const [editing, setEditing] = useState(false);
  const pending = approval.status === "pending";
  const dirty = subject !== approval.subject || body !== approval.body;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Mono className="text-ink">{approval.id}</Mono>
        <span className="text-[12.5px] text-muted">· {kindLabel[approval.kind]}</span>
        <span className="ml-auto"><ApprovalBadge s={approval.status} /></span>
      </div>

      <div className="mt-3 rounded-xl border border-line bg-white">
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-2 text-[12.5px] text-muted">
          <Mail className="size-3.5" /> <span className="truncate">To: {approval.to}</span>
        </div>
        {editing && pending ? (
          <div className="space-y-2 p-3">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-9 w-full rounded-lg border border-line px-3 text-[13.5px] font-medium focus:border-emerald/50 focus:outline-none"
              aria-label="Konu"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={compact ? 11 : 15}
              className="w-full resize-y rounded-lg border border-line px-3 py-2 text-[13px] leading-relaxed focus:border-emerald/50 focus:outline-none"
              aria-label="E-posta metni"
            />
          </div>
        ) : (
          <div className="p-3.5">
            <p className="text-[13.5px] font-medium text-ink">{subject}</p>
            <p className={`mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ink/90 ${compact ? "max-h-64 overflow-y-auto pr-1" : ""}`}>{body}</p>
          </div>
        )}
      </div>

      {pending ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button icon={Check} onClick={() => approve(approval.id, { subject, body })}>Onayla ve demo gönder</Button>
            <Button variant="secondary" icon={Pencil} onClick={() => setEditing((e) => !e)}>{editing ? "Önizle" : "Düzenle"}</Button>
            <Button variant="danger" icon={Ban} onClick={() => reject(approval.id)}>Reddet</Button>
          </div>
          <p className="mt-2 text-[12px] text-muted">
            {dirty ? "Düzenlemeleriniz onayla birlikte kaydedilir. " : ""}Demo modunda gerçek e-posta gönderilmez.
          </p>
        </>
      ) : (
        <p className="mt-3 text-[12.5px] text-muted">
          {approval.status === "approved" ? "Demo gönderimi tamamlandı; gerçek e-posta gönderilmedi." : "Taslak reddedildi."}
          {approval.decidedAt && ` · ${formatStamp(approval.decidedAt)}`}
          {approval.edited && " · Düzenlenerek onaylandı"}
        </p>
      )}
    </div>
  );
}
