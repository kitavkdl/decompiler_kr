import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ITEM_BY_ID, ITEM_ORDER } from "@/lib/orderCodec";
import { useSoldOut, setSoldOut } from "@/lib/soldOut";

const ADMIN_PASSWORD = "1029";
const spring = { type: "spring" as const, stiffness: 320, damping: 22 };

type HotdogOpt = {
  no_relish?: boolean;
  addon?: string | null;
  addon_name?: string | null;
};
type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  hotdog_options?: HotdogOpt[];
};
type OrderRow = {
  id: string;
  nickname: string;
  items: OrderItem[];
  total: number;
  paid: boolean;
  status: string;
  payment_method: string | null;
  created_at: string;
};

function normalize(row: Record<string, unknown>): OrderRow {
  const rawItems = row.items;
  return {
    id: String(row.id),
    nickname: String(row.nickname ?? ""),
    items: Array.isArray(rawItems) ? (rawItems as OrderItem[]) : [],
    total: Number(row.total) || 0,
    paid: Boolean(row.paid),
    status: String(row.status ?? "pending"),
    payment_method: (row.payment_method as string | null) ?? null,
    created_at: String(row.created_at ?? ""),
  };
}

export default function AdminStatsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const soldOut = useSoldOut();

  useEffect(() => {
    if (!open) {
      setUnlocked(false);
      setPwd("");
      setConfirmReset(false);
    }
  }, [open]);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("booth", "decompiler")
      .order("created_at", { ascending: false })
      .limit(1000);
    setLoading(false);
    if (error) {
      toast.error("주문 불러오기 실패");
      return;
    }
    setOrders((data ?? []).map((d) => normalize(d as Record<string, unknown>)));
  };

  useEffect(() => {
    if (open && unlocked) fetchAll();
  }, [open, unlocked]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.paid);
    const totalRevenue = paid.reduce((s, o) => s + o.total, 0);
    const totalOrders = paid.length;
    const uniqueCustomers = new Set(
      paid.map((o) => o.nickname.trim().toLowerCase())
    ).size;
    const cash = paid.filter((o) => o.payment_method === "cash").length;
    const transfer = paid.filter((o) => o.payment_method === "transfer").length;
    const doneCount = paid.filter((o) => o.status === "done").length;
    const pendingCount = paid.filter((o) => o.status !== "done").length;
    const unpaid = orders.length - paid.length;

    // Item leaderboard.
    const counts: Record<string, { name: string; qty: number; revenue: number }> =
      {};
    for (const o of paid) {
      for (const it of o.items) {
        const key = it.id;
        const name = ITEM_BY_ID[key]?.name ?? it.name ?? key;
        if (!counts[key]) counts[key] = { name, qty: 0, revenue: 0 };
        counts[key].qty += it.qty;
        counts[key].revenue += (it.price || 0) * it.qty;
      }
    }
    const leaderboard = Object.values(counts).sort((a, b) => b.qty - a.qty);

    return {
      totalRevenue,
      totalOrders,
      uniqueCustomers,
      cash,
      transfer,
      doneCount,
      pendingCount,
      unpaid,
      leaderboard,
    };
  }, [orders]);

  const tryUnlock = () => {
    if (pwd.trim() === ADMIN_PASSWORD) {
      setUnlocked(true);
      setPwd("");
    } else {
      toast.error("비밀번호가 틀렸어요");
      setPwd("");
    }
  };

  const deleteOne = async (id: string, nickname: string) => {
    if (!window.confirm(`'${nickname}' 주문을 삭제할까요?`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      toast.error("삭제 실패");
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success("삭제 완료");
  };

  const resetAll = async () => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("booth", "decompiler");
    if (error) {
      toast.error("리셋 실패");
      return;
    }
    setOrders([]);
    setConfirmReset(false);
    toast.success("모든 주문이 리셋되었습니다");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-extrabold">📊 관리자</h2>
                <p className="text-xs text-stone-500">
                  통계 · 주문 삭제 · 전체 리셋
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-stone-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {!unlocked ? (
              <div className="space-y-3 py-4">
                <p className="text-sm text-stone-600">
                  🔒 관리자 비밀번호를 입력하세요
                </p>
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={pwd}
                  onChange={(e) =>
                    setPwd(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") tryUnlock();
                  }}
                  placeholder="● ● ● ●"
                  className="w-full rounded-xl px-3 py-3 text-center text-2xl font-bold tracking-[0.6em] border-2 border-stone-200 focus:outline-none focus:border-orange-400 bg-stone-50"
                />
                <button
                  onClick={tryUnlock}
                  className="w-full bg-stone-900 text-white font-bold py-3 rounded-full active:scale-95 transition"
                >
                  잠금 해제
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    label="총 매출"
                    value={`₩${stats.totalRevenue.toLocaleString()}`}
                    color="bg-orange-100 text-orange-800"
                  />
                  <StatCard
                    label="결제 완료 주문"
                    value={`${stats.totalOrders}건`}
                    color="bg-stone-100 text-stone-800"
                  />
                  <StatCard
                    label="고유 닉네임"
                    value={`${stats.uniqueCustomers}명`}
                    color="bg-sky-100 text-sky-800"
                  />
                  <StatCard
                    label="제공 완료 / 대기"
                    value={`${stats.doneCount} / ${stats.pendingCount}`}
                    color="bg-green-100 text-green-800"
                  />
                  <StatCard
                    label="현금 / 입금"
                    value={`${stats.cash} / ${stats.transfer}`}
                    color="bg-yellow-100 text-yellow-800"
                  />
                  <StatCard
                    label="미결제 대기"
                    value={`${stats.unpaid}건`}
                    color="bg-red-100 text-red-800"
                  />
                </div>

                {/* Leaderboard */}
                <div>
                  <h3 className="font-extrabold mb-2 text-sm">🏆 메뉴 판매 순위</h3>
                  <div className="bg-stone-50 rounded-2xl divide-y divide-stone-200">
                    {stats.leaderboard.length === 0 && (
                      <div className="p-4 text-center text-xs text-stone-400">
                        결제 완료된 주문이 없어요
                      </div>
                    )}
                    {stats.leaderboard.map((row, i) => (
                      <div
                        key={row.name + i}
                        className="flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs text-stone-400 w-5 shrink-0">
                            {i + 1}.
                          </span>
                          <span className="truncate">{row.name}</span>
                        </span>
                        <span className="flex items-center gap-3 shrink-0 text-xs">
                          <span className="font-bold">x{row.qty}</span>
                          <span className="text-stone-500">
                            ₩{row.revenue.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sold-out toggles */}
                <div>
                  <h3 className="font-extrabold mb-2 text-sm">
                    🚫 품절 관리{" "}
                    <span className="text-[10px] font-normal text-stone-400">
                      탭하여 토글 · 주문 화면에 즉시 반영
                    </span>
                  </h3>
                  <div className="bg-stone-50 rounded-2xl divide-y divide-stone-200">
                    {ITEM_ORDER.filter((it) => it.group !== "addon").map((it) => {
                      const out = soldOut.has(it.id);
                      return (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => setSoldOut(it.id, !out)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left active:scale-[0.99] transition"
                        >
                          <span
                            className={`min-w-0 truncate ${out ? "text-stone-400 line-through" : "text-stone-800"}`}
                          >
                            {it.name}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                              out ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            }`}
                          >
                            {out ? "🚫 품절" : "✅ 판매중"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Order list with delete */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-sm">
                      🗂️ 주문 목록 ({orders.length})
                    </h3>
                    <button
                      onClick={fetchAll}
                      disabled={loading}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                    >
                      ↻ 새로고침
                    </button>
                  </div>
                  <div className="bg-stone-50 rounded-2xl max-h-64 overflow-y-auto divide-y divide-stone-200">
                    {orders.length === 0 && (
                      <div className="p-4 text-center text-xs text-stone-400">
                        주문이 없습니다
                      </div>
                    )}
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold truncate">
                            {o.nickname}{" "}
                            <span className="text-stone-400 font-normal">
                              ₩{o.total.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono truncate">
                            #{o.id.slice(0, 6)} ·{" "}
                            {new Date(o.created_at).toLocaleString("ko-KR", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            ·{" "}
                            {o.paid
                              ? o.status === "done"
                                ? "✅ 제공"
                                : "⏳ 대기"
                              : "💤 미결제"}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteOne(o.id, o.nickname)}
                          className="text-[11px] font-bold text-red-600 hover:text-white hover:bg-red-600 px-2 py-1 rounded-md border border-red-200 transition"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset all */}
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <h3 className="font-extrabold text-red-700 text-sm mb-1">
                    ⚠️ 전체 주문 리셋
                  </h3>
                  <p className="text-xs text-red-700/80 leading-relaxed mb-3">
                    모든 주문 데이터가 영구 삭제됩니다. 되돌릴 수 없어요.
                  </p>
                  {!confirmReset ? (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="w-full bg-white border-2 border-red-300 text-red-700 font-bold py-2 rounded-xl active:scale-95 transition"
                    >
                      모든 주문 리셋
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmReset(false)}
                        className="flex-1 bg-white border border-stone-300 text-stone-700 font-bold py-2 rounded-xl"
                      >
                        취소
                      </button>
                      <button
                        onClick={resetAll}
                        className="flex-1 bg-red-600 text-white font-extrabold py-2 rounded-xl active:scale-95 transition"
                      >
                        정말 리셋
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-3 ${color}`}>
      <div className="text-[10px] font-bold opacity-70">{label}</div>
      <div className="text-lg font-extrabold leading-tight mt-0.5">{value}</div>
    </div>
  );
}
