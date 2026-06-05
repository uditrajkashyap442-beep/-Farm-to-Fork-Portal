"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Check,
  Loader2,
  ChevronDown,
  X,
  ArrowRight,
  Wheat,
  FlaskConical,
  Warehouse as WarehouseIcon,
  ShieldCheck,
  Droplets,
  Ruler,
  CircleDot,
  Package,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Types
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface QAResult {
  id: string;
  batch_id: string;
  moisture_percent: number;
  grain_length_mm: number;
  broken_percent: number;
  tested_by: string;
  tested_at: string;
}

interface Batch {
  id: string;
  batch_number: string;
  vendor_name: string;
  mandi_location: string;
  weight_tonnes: number;
  status: "PENDING_QA" | "APPROVED" | "REJECTED";
  created_at: string;
  qa_result?: QAResult | null;
}

type UserRole = "ADMIN" | "PROCUREMENT" | "QA" | "WAREHOUSE";

const ROLES: { key: UserRole; label: string; icon: React.ReactNode }[] = [
  { key: "ADMIN",       label: "Supervisor",  icon: <ShieldCheck className="w-4 h-4" /> },
  { key: "PROCUREMENT", label: "Procurement", icon: <Wheat className="w-4 h-4" /> },
  { key: "QA",          label: "QA Lab",      icon: <FlaskConical className="w-4 h-4" /> },
  { key: "WAREHOUSE",   label: "Warehouse",   icon: <WarehouseIcon className="w-4 h-4" /> },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Helpers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function Badge({ status }: { status: Batch["status"] }) {
  const map = {
    PENDING_QA: { label: "Pending QA", bg: "bg-amber-wash", text: "text-amber-ink", dot: "bg-amber" },
    APPROVED:   { label: "Approved",   bg: "bg-green-wash",  text: "text-teal-ink",  dot: "bg-green" },
    REJECTED:   { label: "Rejected",   bg: "bg-red-wash",    text: "text-red-ink",   dot: "bg-red" },
  } as const;
  const c = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${c.bg} ${c.text}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${c.dot} ${status === "PENDING_QA" ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Dashboard() {
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<Batch | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);

  // Procurement modal
  const [procOpen, setProcOpen] = useState(false);
  const [pVendor, setPVendor] = useState("");
  const [pMandi, setPMandi] = useState("");
  const [pWeight, setPWeight] = useState("");
  const [pDate, setPDate] = useState(new Date().toISOString().slice(0, 10));
  const [pBusy, setPBusy] = useState(false);
  const [pMsg, setPMsg] = useState<{ ok: boolean; t: string } | null>(null);

  // QA modal
  const [qaTarget, setQaTarget] = useState<Batch | null>(null);
  const [qM, setQM] = useState("");
  const [qL, setQL] = useState("");
  const [qB, setQB] = useState("");
  const [qTester, setQTester] = useState("Dr. Amit Verma");
  const [qBusy, setQBusy] = useState(false);
  const [qMsg, setQMsg] = useState<{ ok: boolean; t: string } | null>(null);

  /* ── Fetch ── */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/batches");
      if (!r.ok) throw 0;
      const d: Batch[] = await r.json();
      setBatches(d);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // keep selected in sync
  useEffect(() => {
    if (selected) {
      const fresh = batches.find((b) => b.id === selected.id);
      if (fresh) setSelected(fresh);
    }
  }, [batches]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Actions ── */
  async function createBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!pVendor || !pMandi || !pWeight) { setPMsg({ ok: false, t: "All fields required." }); return; }
    setPBusy(true); setPMsg(null);
    try {
      const r = await fetch("/api/batches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vendor_name: pVendor, mandi_location: pMandi, weight_tonnes: pWeight, arrival_date: pDate }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPMsg({ ok: true, t: `Created ${d.batch_number}` });
      setPVendor(""); setPMandi(""); setPWeight("");
      load();
      setTimeout(() => { setProcOpen(false); setPMsg(null); }, 1000);
    } catch (err: unknown) { setPMsg({ ok: false, t: err instanceof Error ? err.message : "Error" }); }
    finally { setPBusy(false); }
  }

  async function submitQA(e: React.FormEvent) {
    e.preventDefault();
    if (!qaTarget || !qM || !qL || !qB) { setQMsg({ ok: false, t: "All fields required." }); return; }
    setQBusy(true); setQMsg(null);
    try {
      const r = await fetch("/api/qa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batch_id: qaTarget.id, moisture_percent: parseFloat(qM), grain_length_mm: parseFloat(qL), broken_percent: parseFloat(qB), tested_by: qTester }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setQMsg({ ok: true, t: "Evaluation recorded." });
      load();
      setTimeout(() => { setQaTarget(null); setQM(""); setQL(""); setQB(""); setQMsg(null); }, 1000);
    } catch (err: unknown) { setQMsg({ ok: false, t: err instanceof Error ? err.message : "Error" }); }
    finally { setQBusy(false); }
  }

  async function patchStatus(id: string, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/batches/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  /* ── Computed ── */
  const total = batches.length;
  const pending = batches.filter((b) => b.status === "PENDING_QA").length;
  const approved = batches.filter((b) => b.status === "APPROVED").length;
  const rejected = batches.filter((b) => b.status === "REJECTED").length;
  const tonnes = batches.reduce((s, b) => s + b.weight_tonnes, 0);

  const rows = batches.filter((b) => {
    const q = search.toLowerCase();
    const hit = b.batch_number.toLowerCase().includes(q) || b.vendor_name.toLowerCase().includes(q) || b.mandi_location.toLowerCase().includes(q);
    return hit && (filter === "ALL" || b.status === filter);
  });

  const mOk = qM ? parseFloat(qM) < 12 : null;
  const lOk = qL ? parseFloat(qL) > 8 : null;
  const bOk = qB ? parseFloat(qB) < 5 : null;
  const allPass = mOk === true && lOk === true && bOk === true;

  const canCreate = role === "ADMIN" || role === "PROCUREMENT";
  const canQA = role === "ADMIN" || role === "QA";
  const canApprove = role === "ADMIN" || role === "WAREHOUSE";

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Render
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <div className="min-h-screen flex flex-col animate-in relative overflow-x-hidden">

      {/* Background Blobs for Glassmorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[15%] w-[400px] h-[400px] rounded-full bg-teal/5 blur-[120px] opacity-60 animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute bottom-[25%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber/5 blur-[150px] opacity-40 animate-pulse" style={{ animationDuration: "18s" }} />
      </div>

      {/* ═══ NAV ═══ */}
      <nav className="sticky top-0 z-40 h-14 bg-raised/60 backdrop-blur-xl border-b border-line/80 relative">
        <div className="max-w-[1360px] mx-auto h-full flex items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center shadow-xs">
              <Wheat className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-ink">Farm‑to‑Fork</span>
            <span className="hidden sm:inline text-[11px] text-ink-faint font-mono ml-1">Traceability</span>
          </div>

          {/* Role picker */}
          <div className="relative">
            <button onClick={() => setRoleOpen(!roleOpen)} className="flex items-center gap-2 text-[12px] font-medium text-ink-secondary hover:text-ink bg-inset/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-line/40 transition-colors cursor-pointer">
              {ROLES.find((r) => r.key === role)!.icon}
              <span className="hidden sm:inline">{ROLES.find((r) => r.key === role)!.label}</span>
              <ChevronDown className="w-3 h-3 text-ink-faint" />
            </button>
            {roleOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRoleOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-50 w-48 bg-raised/75 backdrop-blur-xl rounded-xl shadow-lg border border-line/80 py-1 animate-in-fast">
                  {ROLES.map((r) => (
                    <button key={r.key} onClick={() => { setRole(r.key); setRoleOpen(false); setSelected(null); }} className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] cursor-pointer transition-colors ${role === r.key ? "text-teal font-semibold bg-teal-wash/60" : "text-ink-secondary hover:bg-inset/50"}`}>
                      {r.icon}
                      {r.label}
                      {role === r.key && <Check className="w-3 h-3 ml-auto" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-5 pt-6 pb-10 flex flex-col gap-5 relative z-10">

        {/* ═══ METRICS STRIP ═══ */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { n: total,                 label: "Total Batches", icon: <Package className="w-4 h-4" />,     color: "text-ink" },
            { n: pending,               label: "Pending QA",    icon: <FlaskConical className="w-4 h-4" />, color: "text-amber" },
            { n: approved,              label: "Approved",      icon: <CheckCircle2 className="w-4 h-4" />, color: "text-teal" },
            { n: rejected,              label: "Rejected",      icon: <XCircle className="w-4 h-4" />,      color: "text-red" },
            { n: `${tonnes.toFixed(1)}T`, label: "Total Weight", icon: <BarChart3 className="w-4 h-4" />,   color: "text-ink" },
          ].map((m, i) => (
            <div key={i} className="bg-raised/40 backdrop-blur-md rounded-xl px-4 py-3.5 shadow-xs border border-line/60 flex items-center gap-3 hover:bg-raised/60 hover:border-line transition-all duration-300">
              <div className={`${m.color} opacity-60`}>{m.icon}</div>
              <div>
                <div className={`text-xl font-bold tracking-tight tabular-nums ${m.color}`}>{m.n}</div>
                <div className="text-[10px] text-ink-faint font-medium uppercase tracking-wide mt-0.5">{m.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ═══ TOOLBAR ═══ */}
        <section className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[12px] pl-8 pr-3 py-[7px] rounded-lg border border-line/60 bg-raised/40 backdrop-blur-md text-ink placeholder:text-ink-faint focus:outline-none focus:border-teal/50 focus:shadow-[0_0_0_3px_rgba(13,125,106,0.08)] focus:bg-raised/75 transition-all w-56"
              />
            </div>
            {/* Filters */}
            <div className="flex items-center bg-inset/50 backdrop-blur-md rounded-lg p-0.5 gap-px border border-line/40">
              {([["ALL","All"],["PENDING_QA","Pending"],["APPROVED","Approved"],["REJECTED","Rejected"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)} className={`text-[11px] font-medium px-2.5 py-[5px] rounded-md transition-all cursor-pointer ${filter === v ? "bg-raised/80 text-ink shadow-xs backdrop-blur-xs" : "text-ink-faint hover:text-ink-secondary"}`}>{l}</button>
              ))}
            </div>
          </div>

          {canCreate && (
            <button onClick={() => setProcOpen(true)} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-teal hover:bg-teal-hover px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer hover:shadow-teal/20">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              New Batch
            </button>
          )}
        </section>

        {/* ═══ CONTENT GRID ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start min-h-0 flex-1">

          {/* ── TABLE ── */}
          <div className="bg-raised/40 backdrop-blur-md rounded-xl shadow-sm border border-line/60 overflow-hidden">
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold border-b border-line/60 bg-wash/50">
                    <th className="pl-5 pr-3 py-2.5">Batch</th>
                    <th className="px-3 py-2.5">Vendor</th>
                    <th className="px-3 py-2.5">Location</th>
                    <th className="px-3 py-2.5 text-right">Weight</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="pl-3 pr-5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {loading && rows.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-line last:border-0">
                        <td className="pl-5 pr-3 py-4"><div className="skel w-24 h-3" /></td>
                        <td className="px-3 py-4"><div className="skel w-28 h-3" /></td>
                        <td className="px-3 py-4"><div className="skel w-20 h-3" /></td>
                        <td className="px-3 py-4 text-right"><div className="skel w-12 h-3 ml-auto" /></td>
                        <td className="px-3 py-4"><div className="skel w-16 h-4" /></td>
                        <td className="pl-3 pr-5 py-4"><div className="skel w-14 h-4 ml-auto" /></td>
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-20 text-ink-faint text-[13px]">No batches found.</td></tr>
                  ) : rows.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelected(b)}
                      className={`border-b border-line last:border-0 group cursor-pointer transition-colors ${selected?.id === b.id ? "bg-teal-wash/60" : "hover:bg-wash/40"}`}
                    >
                      <td className="pl-5 pr-3 py-3.5">
                        <div className="font-semibold text-ink leading-tight">{b.batch_number}</div>
                        <div className="text-[10px] text-ink-faint font-mono mt-0.5">{relativeTime(b.created_at)}</div>
                      </td>
                      <td className="px-3 py-3.5 text-ink-secondary">{b.vendor_name}</td>
                      <td className="px-3 py-3.5 text-ink-secondary">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-ink-faint shrink-0" />{b.mandi_location}</span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono font-semibold text-ink tabular-nums">{b.weight_tonnes}</td>
                      <td className="px-3 py-3.5">
                        <Badge status={b.status} />
                      </td>
                      <td className="pl-3 pr-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {canQA && b.status === "PENDING_QA" && (
                            <button onClick={() => { setQaTarget(b); setQM(""); setQL(""); setQB(""); setQMsg(null); }} className="text-[11px] font-semibold text-amber-ink bg-amber-wash hover:bg-amber/10 px-2 py-1 rounded-md transition-colors cursor-pointer">Test</button>
                          )}
                          {canApprove && b.qa_result && (
                            <>
                              <button onClick={() => patchStatus(b.id, "APPROVED")} disabled={b.status === "APPROVED"} className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${b.status === "APPROVED" ? "text-teal-ink bg-green-wash cursor-default" : "text-ink-faint hover:text-teal-ink hover:bg-green-wash"}`}>Approve</button>
                              <button onClick={() => patchStatus(b.id, "REJECTED")} disabled={b.status === "REJECTED"} className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${b.status === "REJECTED" ? "text-red-ink bg-red-wash cursor-default" : "text-ink-faint hover:text-red-ink hover:bg-red-wash"}`}>Reject</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── DETAIL PANEL ── */}
          <aside className="hidden lg:block sticky top-[72px] z-10">
            {selected ? (
              <div className="bg-raised/55 backdrop-blur-md rounded-xl shadow-sm border border-line/60 animate-in-fast">
                {/* Head */}
                <div className="px-5 pt-5 pb-4 border-b border-line/60 flex items-start justify-between">
                  <div>
                    <div className="text-[15px] font-bold tracking-tight text-ink">{selected.batch_number}</div>
                    <div className="text-[11px] text-ink-faint font-mono mt-1">{fmtDate(selected.created_at)}</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1 rounded-md text-ink-faint hover:text-ink hover:bg-inset/50 cursor-pointer transition-colors"><X className="w-4 h-4" /></button>
                </div>

                <div className="p-5 flex flex-col gap-5">
                  <Badge status={selected.status} />

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-wash/40 border border-line/30 rounded-lg p-3">
                      <div className="text-[10px] text-ink-faint uppercase tracking-wide font-medium mb-1">Vendor</div>
                      <div className="text-[12px] font-semibold text-ink">{selected.vendor_name}</div>
                    </div>
                    <div className="bg-wash/40 border border-line/30 rounded-lg p-3">
                      <div className="text-[10px] text-ink-faint uppercase tracking-wide font-medium mb-1">Mandi</div>
                      <div className="text-[12px] font-semibold text-ink">{selected.mandi_location}</div>
                    </div>
                    <div className="bg-wash/40 border border-line/30 rounded-lg p-3">
                      <div className="text-[10px] text-ink-faint uppercase tracking-wide font-medium mb-1">Weight</div>
                      <div className="text-[12px] font-semibold text-ink font-mono">{selected.weight_tonnes} T</div>
                    </div>
                    <div className="bg-wash/40 border border-line/30 rounded-lg p-3">
                      <div className="text-[10px] text-ink-faint uppercase tracking-wide font-medium mb-1">Arrived</div>
                      <div className="text-[12px] font-semibold text-ink">{relativeTime(selected.created_at)}</div>
                    </div>
                  </div>

                  {/* QA Results */}
                  {selected.qa_result ? (
                    <div>
                      <div className="text-[10px] text-ink-faint uppercase tracking-wide font-semibold mb-2.5">Lab Results</div>
                      <div className="flex flex-col gap-2">
                        {[
                          { icon: <Droplets className="w-3.5 h-3.5" />, label: "Moisture", val: `${selected.qa_result.moisture_percent}%`, target: "< 12%", pass: selected.qa_result.moisture_percent < 12 },
                          { icon: <Ruler className="w-3.5 h-3.5" />,    label: "Grain Length", val: `${selected.qa_result.grain_length_mm} mm`, target: "> 8 mm", pass: selected.qa_result.grain_length_mm > 8 },
                          { icon: <CircleDot className="w-3.5 h-3.5" />, label: "Broken",  val: `${selected.qa_result.broken_percent}%`, target: "< 5%", pass: selected.qa_result.broken_percent < 5 },
                        ].map((m) => (
                          <div key={m.label} className={`flex items-center justify-between p-2.5 rounded-lg border ${m.pass ? "bg-green-wash/50 border-teal/10" : "bg-red-wash/50 border-red/10"}`}>
                            <div className="flex items-center gap-2 text-[12px] text-ink-secondary">
                              <span className={m.pass ? "text-teal" : "text-red"}>{m.icon}</span>
                              {m.label}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold font-mono text-ink tabular-nums">{m.val}</span>
                              <span className={`text-[10px] font-mono ${m.pass ? "text-teal" : "text-red"}`}>{m.target}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-ink-faint font-mono mt-2.5">
                        Tested by {selected.qa_result.tested_by} · {fmtDate(selected.qa_result.tested_at)}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-wash/40 border border-amber/10 rounded-lg p-4 text-center">
                      <FlaskConical className="w-5 h-5 text-amber mx-auto mb-1.5 opacity-60" />
                      <p className="text-[11px] text-amber-ink font-medium">Awaiting lab measurements</p>
                    </div>
                  )}

                  {/* Trace steps */}
                  <div>
                    <div className="text-[10px] text-ink-faint uppercase tracking-wide font-semibold mb-2.5">Traceability</div>
                    <div className="flex flex-col">
                      {[
                        { n: 1, label: "Procured", done: true },
                        { n: 2, label: "Lab Tested", done: !!selected.qa_result },
                        { n: 3, label: selected.status === "APPROVED" ? "Released" : selected.status === "REJECTED" ? "Returned" : "Pending", done: selected.status !== "PENDING_QA" },
                      ].map((s, i) => (
                        <div key={s.n} className="flex items-start gap-2.5">
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${s.done ? "bg-teal text-white" : "bg-inset/60 text-ink-faint border border-line"}`}>{s.n}</div>
                            {i < 2 && <div className={`w-px h-5 ${s.done ? "bg-teal/30" : "bg-line"}`} />}
                          </div>
                          <div className={`text-[12px] pt-0.5 ${s.done ? "text-ink font-medium" : "text-ink-faint"}`}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-raised/45 backdrop-blur-md rounded-xl shadow-xs border border-line/60 p-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-inset/50 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-5 h-5 text-ink-faint" />
                </div>
                <p className="text-[12px] text-ink-faint leading-relaxed">Select a batch to inspect its<br />traceability and QA results.</p>
              </div>
            )}
          </aside>
        </section>
      </main>

      {/* ═══ PROCUREMENT MODAL ═══ */}
      {procOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setProcOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-raised/75 backdrop-blur-xl w-full max-w-[420px] rounded-xl shadow-2xl border border-line-strong/80 animate-in-fast" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-line/60">
              <h3 className="text-[14px] font-bold tracking-tight text-ink">Register Batch</h3>
              <button onClick={() => setProcOpen(false)} className="p-1 rounded-md text-ink-faint hover:text-ink hover:bg-inset/50 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={createBatch} className="p-5 flex flex-col gap-3.5">
              <Field label="Farmer / Vendor" placeholder="Karan Singh" value={pVendor} onChange={setPVendor} />
              <Field label="Mandi Location" placeholder="Karnal Mandi" value={pMandi} onChange={setPMandi} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Weight (T)" placeholder="15.5" type="number" step="0.01" value={pWeight} onChange={setPWeight} />
                <Field label="Arrival Date" type="date" value={pDate} onChange={setPDate} />
              </div>
              {pMsg && <Msg ok={pMsg.ok}>{pMsg.t}</Msg>}
              <button type="submit" disabled={pBusy} className="mt-1 w-full flex items-center justify-center gap-2 text-[12px] font-semibold text-white bg-teal hover:bg-teal-hover py-2.5 rounded-lg transition-colors cursor-pointer hover:shadow-teal/20">
                {pBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-3.5 h-3.5" strokeWidth={2.5} />Register</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ QA MODAL ═══ */}
      {qaTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setQaTarget(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-raised/75 backdrop-blur-xl w-full max-w-[420px] rounded-xl shadow-2xl border border-line-strong/80 animate-in-fast" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-line/60">
              <div>
                <h3 className="text-[14px] font-bold tracking-tight text-ink">QA Lab Evaluation</h3>
                <p className="text-[11px] text-ink-faint font-mono mt-0.5">{qaTarget.batch_number} · {qaTarget.vendor_name}</p>
              </div>
              <button onClick={() => setQaTarget(null)} className="p-1 rounded-md text-ink-faint hover:text-ink hover:bg-inset/50 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submitQA} className="p-5 flex flex-col gap-3.5">
              <div className="text-[11px] text-ink-faint bg-wash/50 border border-line/60 rounded-lg px-3 py-2.5 flex items-start gap-2 backdrop-blur-xs">
                <AlertCircle className="w-3.5 h-3.5 text-teal shrink-0 mt-px" />
                <span>Moisture &lt;12% · Length &gt;8mm · Broken &lt;5%</span>
              </div>
              <QAField label="Moisture (%)" placeholder="11.2" value={qM} onChange={setQM} pass={mOk} failText="≥ 12%" />
              <QAField label="Grain Length (mm)" placeholder="8.5" value={qL} onChange={setQL} pass={lOk} failText="≤ 8mm" />
              <QAField label="Broken Grain (%)" placeholder="3.2" value={qB} onChange={setQB} pass={bOk} failText="≥ 5%" />
              <Field label="Tested By" value={qTester} onChange={setQTester} />

              {mOk !== null && lOk !== null && bOk !== null && (
                <div className={`text-[11px] font-semibold px-3 py-2 rounded-lg flex items-center gap-2 ${allPass ? "bg-green-wash/60 text-teal-ink" : "bg-red-wash/60 text-red-ink"}`}>
                  {allPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {allPass ? "Compliant — will be Approved" : "Non-compliant — will be Rejected"}
                </div>
              )}
              {qMsg && <Msg ok={qMsg.ok}>{qMsg.t}</Msg>}
              <button type="submit" disabled={qBusy} className="mt-1 w-full flex items-center justify-center gap-2 text-[12px] font-semibold text-white bg-teal hover:bg-teal-hover py-2.5 rounded-lg transition-colors cursor-pointer hover:shadow-teal/20">
                {qBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit<ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-line/60 mt-auto relative z-10">
        <div className="max-w-[1360px] mx-auto px-5 py-4 flex items-center justify-between text-[10px] text-ink-faint font-mono">
          <span>© 2026 LT Foods Ltd.</span>
          <span>v1.0</span>
        </div>
      </footer>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Shared micro‑components
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Field({ label, placeholder, value, onChange, type = "text", step }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string; step?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-ink-secondary mb-1">{label}</label>
      <input type={type} step={step} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-[12px] px-3 py-2 rounded-lg border border-line/60 bg-inset/50 backdrop-blur-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-teal/50 focus:shadow-[0_0_0_3px_rgba(13,125,106,0.08)] focus:bg-inset/85 transition-all" />
    </div>
  );
}

function QAField({ label, placeholder, value, onChange, pass, failText }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; pass: boolean | null; failText: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-semibold text-ink-secondary">{label}</label>
        {pass !== null && <span className={`text-[10px] font-semibold ${pass ? "text-teal" : "text-red"}`}>{pass ? "Pass" : `Fail — ${failText}`}</span>}
      </div>
      <input type="number" step="0.1" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full text-[12px] px-3 py-2 rounded-lg border bg-inset/50 backdrop-blur-xs text-ink placeholder:text-ink-faint focus:outline-none transition-all ${pass === false ? "border-red/30 focus:border-red/50 focus:shadow-[0_0_0_3px_rgba(196,57,44,0.06)]" : "border-line/60 focus:border-teal/50 focus:shadow-[0_0_0_3px_rgba(13,125,106,0.08)] focus:bg-inset/85"}`} />
    </div>
  );
}

function Msg({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={`text-[11px] font-medium px-3 py-2 rounded-lg flex items-center gap-2 ${ok ? "bg-green-wash text-teal-ink" : "bg-red-wash text-red-ink"}`}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </div>
  );
}
