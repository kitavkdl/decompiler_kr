import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SKCS_ITEM_BY_ID, type SkcsCategory } from "@/lib/skcsCodec";
import SkcsAdminStatsModal from "@/components/SkcsAdminStatsModal";

type CustomOpt = {
  base?: string;
  switch?: string;
  switch_name?: string;
  ring?: string;
  keycaps?: string[];
};
type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  custom_options?: CustomOpt[];
};

type Order = {
  id: string;
  nickname: string;
  items: OrderItem[];
  total: number;
  status: string;
  paid: boolean;
  payment_method: string | null;
  payment_code: string | null;
  created_at: string;
};

const spring = { type: "spring" as const, stiffness: 320, damping: 22 };

const CATEGORIES: { key: SkcsCategory; label: string; emoji: string; color: string }[] = [
  { key: "keycap",    label: "키캡 클리커",   emoji: "🔑", color: "amber" },
  { key: "clicker67", label: "67 클리커",     emoji: "6️⃣", color: "sky" },
  { key: "nfc",       label: "NFC 오레오",    emoji: "🍪", color: "rose" },
];

function normalizeOrder(row: Record<string, unknown>): Order {
  const rawItems = row.items;
  const items: OrderItem[] = Array.isArray(rawItems) ? (rawItems as OrderItem[]) : [];
  return {
    id: String(row.id),
    nickname: String(row.nickname),
    items,
    total: Number(row.total) || 0,
    status: String(row.status ?? "pending"),
    paid: Boolean(row.paid),
    payment_method: (row.payment_method as string | null) ?? null,
    payment_code: (row.payment_code as string | null) ?? null,
    created_at: String(row.created_at),
  };
}

function itemsForCategory(o: Order, cat: SkcsCategory): OrderItem[] {
  return o.items.filter((it) => SKCS_ITEM_BY_ID[it.id]?.category === cat);
}

export default function SkcsWhatIsOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const [showAdmin, setShowAdmin] = useState(false);
  const [readyChecks, setReadyChecks] = useState<Set<string>>(new Set());
  const toggleReady = (key: string) => {
    setReadyChecks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const highlight = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("booth", "skcs")
        .order("created_at", { ascending: false })
        .limit(500);
      if (mounted && data) {
        setOrders(data.map((d) => normalizeOrder(d as Record<string, unknown>)));
      }
    };

    fetchAll();

    const channel = supabase
      .channel("skcs-orders-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const isMine = (row: Record<string, unknown> | null | undefined) =>
            row && row.booth === "skcs";
          if (payload.eventType === "INSERT") {
            if (!isMine(payload.new as Record<string, unknown>)) return;
            const o = normalizeOrder(payload.new as Record<string, unknown>);
            setOrders((prev) => (prev.some((x) => x.id === o.id) ? prev : [o, ...prev]));
            if (o.paid) toast.success(`새 주문! ${o.nickname}`);
          } else if (payload.eventType === "UPDATE") {
            if (!isMine(payload.new as Record<string, unknown>)) return;
            const o = normalizeOrder(payload.new as Record<string, unknown>);
            setOrders((prev) => {
              const prevOrder = prev.find((x) => x.id === o.id);
              if (o.paid && prevOrder && !prevOrder.paid) {
                toast.success(`결제 확인! ${o.nickname}`);
              }
              if (!prevOrder) return [o, ...prev];
              return prev.map((x) => (x.id === o.id ? o : x));
            });
          } else if (payload.eventType === "DELETE") {
            const id = String((payload.old as { id?: string })?.id || "");
            if (id) setOrders((prev) => prev.filter((x) => x.id !== id));
          }
        }
      )
      .subscribe();

    const interval = window.setInterval(fetchAll, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchAll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const toggleStatus = async (o: Order) => {
    const next = o.status === "done" ? "pending" : "done";
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", o.id);
    if (error) toast.error("상태 변경 실패");
  };

  const paidOrders = useMemo(() => orders.filter((o) => o.paid), [orders]);
  const visible = paidOrders.filter((o) => (filter === "all" ? true : o.status === filter));

  return (
    <div className="show-cursor min-h-screen bg-sky-50 text-slate-900 px-4 py-6 md:px-8">
      <header className="max-w-7xl mx-auto mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-sky-600">📋 SKCS 키링 현황판</h1>
            <p className="text-sm text-slate-900">실시간으로 들어오는 결제 완료 주문</p>
          </div>
          <button
            onClick={() => setShowAdmin(true)}
            className="text-sm font-bold bg-white text-sky-600 border border-sky-200 px-4 py-2 rounded-full active:scale-95 transition"
          >
            📊 관리자
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["pending", "done", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                filter === f
                  ? "bg-sky-500 text-slate-900"
                  : "bg-white text-slate-900 border border-sky-200"
              }`}
            >
              {f === "pending" ? "대기중" : f === "done" ? "완료" : "전체"}
              <span className="ml-2 text-xs opacity-70">
                {paidOrders.filter((o) => (f === "all" ? true : o.status === f)).length}
              </span>
            </button>
          ))}
          <div className="ml-auto text-xs text-slate-900 self-center">
            미결제 대기: {orders.filter((o) => !o.paid).length}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-4 md:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const ordersInCat = visible.filter((o) => itemsForCategory(o, cat.key).length > 0);
          return (
            <section key={cat.key} className="flex flex-col">
              <div className="flex items-center justify-between mb-3 px-4 py-3 rounded-2xl bg-white border border-sky-200">
                <h2 className="font-extrabold text-lg flex items-center gap-2 text-sky-600">
                  <span className="text-2xl">{cat.emoji}</span>
                  {cat.label}
                </h2>
                <span className="text-sm font-bold bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full">
                  {ordersInCat.reduce(
                    (s, o) => s + itemsForCategory(o, cat.key).reduce((a, it) => a + it.qty, 0),
                    0
                  )}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {ordersInCat.map((o) => {
                    const catItems = itemsForCategory(o, cat.key);
                    return (
                      <motion.article
                        layout
                        key={o.id + cat.key}
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={spring}
                        className={`rounded-2xl p-4 shadow-sm bg-white border-2 ${
                          o.id === highlight
                            ? "border-sky-500 ring-4 ring-sky-500/30"
                            : o.status === "done"
                            ? "border-emerald-700/50 opacity-70"
                            : "border-sky-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="min-w-0">
                            <div className="text-xl font-extrabold leading-tight truncate">
                              {o.nickname}
                            </div>
                            <div className="text-[10px] text-slate-900 font-mono">
                              #{o.id.slice(0, 6)} ·{" "}
                              {new Date(o.created_at).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                              o.payment_method === "cash"
                                ? "bg-sky-100 text-slate-900"
                                : "bg-sky-500/20 text-sky-700"
                            }`}
                          >
                            {o.payment_method === "cash" ? "💵 현금" : "🏦 입금"}
                          </span>
                        </div>

                        <ul className="space-y-2 mb-2">
                          {catItems.map((it) => {
                            return (
                              <li key={it.id} className="font-semibold">
                                <div className="flex justify-between items-center gap-2 bg-sky-100 rounded-xl px-3 py-2">
                                  <span className="truncate pr-2 text-lg font-extrabold leading-tight">
                                    {it.name}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-mono text-2xl font-extrabold text-sky-600 tabular-nums">
                                      x{it.qty}
                                    </span>
                                    {(() => {
                                      const key = `${o.id}:${cat.key}:${it.id}`;
                                      const checked = readyChecks.has(key);
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => toggleReady(key)}
                                          aria-label="준비 완료 체크"
                                          className={`shrink-0 w-8 h-8 rounded-md border-2 flex items-center justify-center transition active:scale-90 ${
                                            checked
                                              ? "bg-emerald-500 border-emerald-500 text-white"
                                              : "bg-white border-sky-300 text-transparent"
                                          }`}
                                        >
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  </div>
                                </div>
                                {/* Customization details for keycap clickers */}
                                {it.custom_options && it.custom_options.length > 0 && (
                                  <ul className="mt-2 ml-1 space-y-2 text-sm font-normal text-slate-900">
                                    {it.custom_options.map((c, i) => (
                                      <li key={i} className="bg-sky-50/60 rounded-lg p-2 border border-sky-200">
                                        <div className="text-[11px] text-slate-900 font-bold mb-1">
                                          #{i + 1}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                                          <div><span className="text-slate-900">Base:</span> <span className="font-bold text-sky-700">{c.base ?? "-"}</span></div>
                                          <div><span className="text-slate-900">Switch:</span> <span className="font-bold text-sky-700">{c.switch_name ?? c.switch ?? "-"}</span></div>
                                          <div><span className="text-slate-900">Ring:</span> <span className="font-bold text-sky-700">{c.ring ?? "-"}</span></div>
                                          <div><span className="text-slate-900">Keycap:</span> <span className="font-bold text-sky-700">{c.keycaps?.join(", ") || "-"}</span></div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>

                        {o.items.length > catItems.length && (
                          <div className="text-[11px] text-slate-900 mb-2 truncate">
                            전체 주문: {o.items.map((it) => `${it.name} x${it.qty}`).join(", ")}
                          </div>
                        )}

                        <button
                          onClick={() => toggleStatus(o)}
                          className={`w-full py-1.5 rounded-full font-bold text-xs transition active:scale-95 ${
                            o.status === "done"
                              ? "bg-sky-100 text-slate-900"
                              : "bg-sky-500 text-slate-900"
                          }`}
                        >
                          {o.status === "done" ? "↩ 대기로" : "✅ 제공 완료"}
                        </button>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
                {ordersInCat.length === 0 && (
                  <div className="text-center text-slate-900 text-sm py-10 bg-white/50 rounded-2xl border border-dashed border-sky-200">
                    주문 없음
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>
      <SkcsAdminStatsModal open={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}
