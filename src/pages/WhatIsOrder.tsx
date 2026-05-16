import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ITEM_BY_ID, type Category } from "@/lib/orderCodec";
import AdminStatsModal from "@/components/AdminStatsModal";

type HotdogOpt = { no_relish?: boolean; addon?: string | null; addon_name?: string | null };
type AdeOpt = { flavor?: "grape" | "lemon" | null; flavor_name?: string | null };
type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  hotdog_options?: HotdogOpt[];
  ade_options?: AdeOpt[];
};

type Order = {
  id: string;
  nickname: string;
  items: OrderItem[];
  total: number;
  is_member: boolean;
  no_relish: boolean;
  member_phrase: string | null;
  status: string;
  paid: boolean;
  payment_method: string | null;
  payment_code: string | null;
  created_at: string;
};

const spring = { type: "spring" as const, stiffness: 320, damping: 22 };

type CatStyle = { headerBg: string; headerBorder: string; headerText: string };
const CATEGORIES: { key: Category; label: string; emoji: string; style: CatStyle }[] = [
  {
    key: "hotdog",
    label: "핫도그",
    emoji: "🌭",
    style: { headerBg: "bg-orange-100", headerBorder: "border-orange-200", headerText: "text-orange-700" },
  },
  {
    key: "drink",
    label: "음료",
    emoji: "🥤",
    style: { headerBg: "bg-sky-100", headerBorder: "border-sky-200", headerText: "text-sky-700" },
  },
  {
    key: "popcorn",
    label: "팝콘",
    emoji: "🍿",
    style: { headerBg: "bg-yellow-100", headerBorder: "border-yellow-200", headerText: "text-yellow-700" },
  },
];

function normalizeOrder(row: Record<string, unknown>): Order {
  const rawItems = row.items;
  const items: OrderItem[] = Array.isArray(rawItems) ? (rawItems as OrderItem[]) : [];
  return {
    id: String(row.id),
    nickname: String(row.nickname),
    items,
    total: Number(row.total) || 0,
    is_member: Boolean(row.is_member),
    no_relish: Boolean(row.no_relish),
    member_phrase: (row.member_phrase as string | null) ?? null,
    status: String(row.status ?? "pending"),
    paid: Boolean(row.paid),
    payment_method: (row.payment_method as string | null) ?? null,
    payment_code: (row.payment_code as string | null) ?? null,
    created_at: String(row.created_at),
  };
}

function itemsForCategory(o: Order, cat: Category): OrderItem[] {
  return o.items.filter((it) => ITEM_BY_ID[it.id]?.categories.includes(cat));
}

export default function WhatIsOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const [showAdmin, setShowAdmin] = useState(false);
  // Local-only "prepared" check marks per (orderId:cat:itemId). Resets on refresh — visual aid only.
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
        .eq("booth", "decompiler")
        .order("created_at", { ascending: false })
        .limit(500);
      if (mounted && data) {
        setOrders(data.map((d) => normalizeOrder(d as Record<string, unknown>)));
      }
    };

    fetchAll();

    // Realtime subscription (instant updates if publication is enabled).
    const channel = supabase
      .channel("orders-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const isMine = (row: Record<string, unknown> | null | undefined) =>
            !row || (row.booth ?? "decompiler") === "decompiler";
          if (payload.eventType === "INSERT") {
            if (!isMine(payload.new as Record<string, unknown>)) return;
            const o = normalizeOrder(payload.new as Record<string, unknown>);
            setOrders((prev) =>
              prev.some((x) => x.id === o.id) ? prev : [o, ...prev]
            );
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

    // Polling fallback — refetch every 60s so the board stays fresh
    // even if realtime is throttled or disconnected.
    const interval = window.setInterval(fetchAll, 60_000);

    // Refetch when tab becomes visible again.
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

  // Only paid orders show on the dashboard.
  const paidOrders = useMemo(() => orders.filter((o) => o.paid), [orders]);

  const visible = paidOrders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  return (
    <div className="show-cursor min-h-screen overflow-x-hidden bg-stone-50 text-stone-900 px-3 py-5 sm:px-4 sm:py-6 md:px-8">
      <header className="max-w-7xl mx-auto mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold break-keep">📋 주문 현황판</h1>
            <p className="text-xs sm:text-sm text-stone-500">실시간으로 들어오는 결제 완료 주문</p>
          </div>
          <button
            onClick={() => setShowAdmin(true)}
            className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-bold bg-white text-stone-900 border border-stone-200 px-3 sm:px-4 py-2 rounded-full active:scale-95 transition"
            aria-label="관리자 통계"
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
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 border border-stone-200"
              }`}
            >
              {f === "pending" ? "대기중" : f === "done" ? "완료" : "전체"}
              <span className="ml-2 text-xs opacity-70">
                {paidOrders.filter((o) => (f === "all" ? true : o.status === f)).length}
              </span>
            </button>
          ))}
          <div className="ml-auto text-xs text-stone-400 self-center">
            미결제 대기: {orders.filter((o) => !o.paid).length}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-4 md:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const ordersInCat = visible.filter((o) => itemsForCategory(o, cat.key).length > 0);
          return (
            <section key={cat.key} className="flex flex-col">
              <div
                className={`flex items-center justify-between mb-3 px-4 py-3 rounded-2xl border ${cat.style.headerBg} ${cat.style.headerBorder}`}
              >
                <h2 className={`font-extrabold text-lg flex items-center gap-2 ${cat.style.headerText}`}>
                  <span className="text-2xl">{cat.emoji}</span>
                  {cat.label}
                </h2>
                <span className={`text-sm font-bold bg-white px-2.5 py-1 rounded-full ${cat.style.headerText}`}>
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
                            ? "border-orange-500 ring-4 ring-orange-200"
                            : o.status === "done"
                            ? "border-green-200 opacity-70"
                            : "border-stone-100"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="min-w-0">
                            <div className="text-xl font-extrabold leading-tight truncate">
                              {o.nickname}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
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
                                ? "bg-stone-100 text-stone-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {o.payment_method === "cash" ? "💵 현금" : "🏦 입금"}
                          </span>
                        </div>

                        <ul className="space-y-2 mb-2">
                          {catItems.map((it) => {
                            const isHotdog = cat.key === "hotdog";
                            const isDrink = cat.key === "drink";
                            const big = isHotdog || isDrink;
                            const displayName =
                              ITEM_BY_ID[it.id]?.displayByCategory?.[cat.key] ?? it.name;
                            return (
                              <li key={it.id} className="font-semibold">
                                <div
                                  className={`flex justify-between items-center gap-2 ${
                                    big
                                      ? "bg-stone-50 rounded-xl px-3 py-2"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`min-w-0 flex-1 pr-2 ${
                                      big
                                        ? "text-xl sm:text-2xl font-extrabold leading-tight break-words"
                                        : "text-sm break-words"
                                    }`}
                                  >
                                    {displayName}
                                    {isDrink && it.ade_options && it.ade_options.length > 0 && (
                                      <span className={big ? "block text-sm sm:text-base font-bold text-sky-700 mt-0.5" : "ml-1 text-sky-700"}>
                                        ({it.ade_options
                                          .map((a) => a.flavor_name || (a.flavor === "grape" ? "청포도" : a.flavor === "lemon" ? "레몬" : "?"))
                                          .join(", ")})
                                      </span>
                                    )}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      className={`font-mono ${
                                        big
                                          ? "text-2xl sm:text-3xl font-extrabold text-orange-600 tabular-nums"
                                          : "text-sm"
                                      }`}
                                    >
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
                                          className={`shrink-0 rounded-md border-2 flex items-center justify-center transition active:scale-90 ${
                                            big ? "w-8 h-8" : "w-6 h-6"
                                          } ${
                                            checked
                                              ? "bg-green-500 border-green-500 text-white"
                                              : "bg-white border-stone-300 text-transparent"
                                          }`}
                                        >
                                          <svg
                                            width={big ? "20" : "14"}
                                            height={big ? "20" : "14"}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  </div>
                                </div>
                                {isHotdog && it.hotdog_options && it.hotdog_options.length > 0 && (
                                  <ul className="mt-1.5 ml-1 space-y-1 text-sm font-normal text-stone-700">
                                    {it.hotdog_options.map((o, i) => {
                                      const parts: string[] = [];
                                      if (o.no_relish) parts.push("렐리쉬 제거");
                                      if (o.addon_name) parts.push(`+ ${o.addon_name}`);
                                      const txt = parts.length ? parts.join(" · ") : "기본";
                                      return (
                                        <li key={i} className="leading-tight">
                                          <span className="text-stone-400 mr-1">ㄴ</span>
                                          <span className="text-stone-400">#{i + 1}</span>{" "}
                                          <span
                                            className={
                                              parts.length
                                                ? "text-orange-700 font-bold"
                                                : "text-stone-400"
                                            }
                                          >
                                            {txt}
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>

                        {/* full order summary collapsed line */}
                        {o.items.length > catItems.length && (
                          <div className="text-[11px] text-stone-400 mb-2 truncate">
                            전체 주문:{" "}
                            {o.items.map((it) => `${it.name} x${it.qty}`).join(", ")}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-2">
                          {cat.key === "hotdog" && o.no_relish && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              🥒 렐리쉬 제거
                            </span>
                          )}
                          {cat.key === "hotdog" && o.is_member && (
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ⭐ 회원 (불닭+치즈 무료)
                            </span>
                          )}
                        </div>

                        {cat.key === "hotdog" && o.is_member && o.member_phrase && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-[11px] mb-2">
                            <span className="font-bold">비밀문구:</span> {o.member_phrase}
                          </div>
                        )}

                        <button
                          onClick={() => toggleStatus(o)}
                          className={`w-full py-1.5 rounded-full font-bold text-xs transition active:scale-95 ${
                            o.status === "done"
                              ? "bg-stone-200 text-stone-600"
                              : "bg-stone-900 text-white"
                          }`}
                        >
                          {o.status === "done" ? "↩ 대기로" : "✅ 제공 완료"}
                        </button>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
                {ordersInCat.length === 0 && (
                  <div className="text-center text-stone-400 text-sm py-10 bg-white/50 rounded-2xl border border-dashed border-stone-200">
                    주문 없음
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>
      <AdminStatsModal open={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}
