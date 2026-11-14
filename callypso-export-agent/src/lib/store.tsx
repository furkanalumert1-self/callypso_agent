"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { DemoState } from "./types";
import { initialState } from "./data";
import { approve as approveFn, isUnanswered, reject as rejectFn, runCommand } from "./agent";

const KEY = "callypso-export-agent-demo";

type Ctx = {
  state: DemoState;
  ready: boolean;
  run: (command: string) => void;
  approve: (id: string, edits: { subject: string; body: string }) => void;
  reject: (id: string) => void;
  toggleTask: (id: string) => void;
  reset: () => void;
  dismissToast: () => void;
  stats: {
    newInquiries: number;
    openQuotes: number;
    pendingApprovals: number;
    openTasks: number;
    unanswered: number;
    pipelineEur: number;
  };
};

const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState;
        if (parsed.version === initialState().version) setState({ ...parsed, toast: undefined });
      }
    } catch {
      /* storage unavailable: keep defaults */
    }
    loaded.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const run = useCallback((c: string) => setState((s) => runCommand(s, c)), []);
  const approve = useCallback((id: string, e: { subject: string; body: string }) => setState((s) => approveFn(s, id, e)), []);
  const reject = useCallback((id: string) => setState((s) => rejectFn(s, id)), []);
  const toggleTask = useCallback(
    (id: string) => setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
    [],
  );
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setState({ ...initialState(), toast: "Demo sıfırlandı; tüm veriler başlangıç durumuna döndü." });
  }, []);
  const dismissToast = useCallback(() => setState((s) => ({ ...s, toast: undefined })), []);

  const stats = useMemo(() => {
    const open = state.quotes.filter((q) => !["accepted", "rejected"].includes(q.status));
    return {
      newInquiries: state.inquiries.filter((i) => i.status === "new").length,
      openQuotes: open.length,
      pendingApprovals: state.approvals.filter((a) => a.status === "pending").length,
      openTasks: state.tasks.filter((t) => !t.done).length,
      unanswered: state.quotes.filter(isUnanswered).length,
      pipelineEur: open.reduce((sum, q) => sum + q.unitPrice * q.quantity, 0),
    };
  }, [state]);

  return (
    <DemoContext.Provider value={{ state, ready, run, approve, reject, toggleTask, reset, dismissToast, stats }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const c = useContext(DemoContext);
  if (!c) throw new Error("useDemo must be used inside DemoProvider");
  return c;
}
