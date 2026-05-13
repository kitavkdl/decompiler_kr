import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Order = {
  id: string;
  nickname: string;
  items: { id: string; name: string; qty: number; price: number }[];
  total: number;
  is_member: boolean;
  no_relish: boolean;
  member_phrase: string | null;
  status: string;
  created_at: string;
};

const spring = { type: "spring" as const, stiffness: 320, damping: 22 };

export default function WhatIsOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const highlight = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    let mounted = true;
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (mounted && data) setOrders(data as Order[]);
      });

    const channel = supabase
      .channel("orders-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
            toast.success(`새 주문! ${(payload.new as Order).nickname}`);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const toggle = async (o: Order) => {
    const next = o.status === "done" ? "pending" : "done";
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
    // optimistic — no update RLS so this only changes local state
  };

  const visible = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 px-4 py-6 md:px-8">
      <header className="max-w-5xl mx-auto mb-5">
        <h1 className="text-3xl font-extrabold">📋 주문 현황판</h1>
        <p className="text-sm text-stone-500">실시간으로 들어오는 주문을 확인하세요</p>
        <div className="mt-4 flex gap-2">
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
                {orders.filter((o) => (f === "all" ? true : o.status === f)).length}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {visible.map((o) => (
            <motion.article
              layout
              key={o.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={spring}
              className={`rounded-2xl p-5 shadow-sm bg-white border-2 ${
                o.id === highlight
                  ? "border-orange-500 ring-4 ring-orange-200"
                  : o.status === "done"
                  ? "border-green-200 opacity-70"
                  : "border-stone-100"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs text-stone-400 font-mono">
                    #{o.id.slice(0, 6)}
                  </div>
                  <div className="text-2xl font-extrabold leading-tight">
                    {o.nickname}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-stone-400">
                    {new Date(o.created_at).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="font-bold text-orange-600">
                    ₩{o.total.toLocaleString()}
                  </div>
                </div>
              </div>

              <ul className="space-y-1 mb-3 text-sm">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.name}</span>
                    <span className="font-mono">x{it.qty}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {o.no_relish && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                    🥒 렐리쉬 피클 제거
                  </span>
                )}
                {o.is_member && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ 회원 (불닭+치즈 무료)
                  </span>
                )}
              </div>

              {o.is_member && o.member_phrase && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs mb-3">
                  <span className="font-bold">비밀문구:</span> {o.member_phrase}
                </div>
              )}

              <button
                onClick={() => toggle(o)}
                className={`w-full py-2 rounded-full font-bold text-sm transition active:scale-95 ${
                  o.status === "done"
                    ? "bg-stone-200 text-stone-600"
                    : "bg-stone-900 text-white"
                }`}
              >
                {o.status === "done" ? "↩ 대기로 되돌리기" : "✅ 제공 완료"}
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
        {visible.length === 0 && (
          <div className="col-span-full text-center text-stone-400 py-20">
            주문이 없습니다
          </div>
        )}
      </main>
    </div>
  );
}
