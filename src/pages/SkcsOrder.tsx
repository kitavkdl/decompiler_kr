import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  SKCS_ITEM_ORDER,
  encodeSkcsOrderCode,
  SKCS_BASE_OPTIONS,
  SKCS_SWITCH_OPTIONS,
  SKCS_KEYCAP_OPTIONS,
  SKCS_RING_OPTIONS,
  type SkcsBase,
  type SkcsSwitch,
  type SkcsKeycap,
  type SkcsRing,
} from "@/lib/skcsCodec";
import { useSkcsSoldOut } from "@/lib/soldOut";
import StaffConfirmModal from "@/components/StaffConfirmModal";

const BANK_INFO = {
  bank: "토스뱅크",
  account: "1002-4730-0262",
  holder: "최원석",
};

const spring = { type: "spring" as const, stiffness: 380, damping: 18 };

type Stage = "cart" | "payment" | "bank-pending" | "done";

type CustomOpt = {
  base: SkcsBase;
  switchType: SkcsSwitch;
  ring: SkcsRing;
  keycaps: SkcsKeycap[]; // length === keyCount
};

const CUSTOM_ITEM_IDS = SKCS_ITEM_ORDER.filter((i) => i.customizable).map((i) => i.id);

function defaultOpt(keyCount: number): CustomOpt {
  return {
    base: "Black",
    switchType: "blue",
    ring: "Silver",
    keycaps: Array(keyCount).fill("Black" as SkcsKeycap),
  };
}

export default function SkcsOrder() {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [customOpts, setCustomOpts] = useState<Record<string, CustomOpt[]>>({});
  const [nickname, setNickname] = useState("");

  const soldOut = useSkcsSoldOut();

  const [stage, setStage] = useState<Stage>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCreatedAt, setOrderCreatedAt] = useState<string | null>(null);
  const [queueAhead, setQueueAhead] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const subtotal = useMemo(
    () => SKCS_ITEM_ORDER.reduce((s, it) => s + (qty[it.id] || 0) * it.price, 0),
    [qty],
  );
  const total = subtotal;
  const itemCount = Object.values(qty).reduce((a, b) => a + b, 0);

  const bump = (id: string, d: number) => {
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + d) }));
  };

  // Sync customOpts arrays with qty for customizable items.
  useEffect(() => {
    setCustomOpts((prev) => {
      const next: Record<string, CustomOpt[]> = {};
      CUSTOM_ITEM_IDS.forEach((id) => {
        const n = qty[id] || 0;
        if (n === 0) return;
        const item = SKCS_ITEM_ORDER.find((x) => x.id === id);
        if (!item) return;
        const existing = prev[id] || [];
        const arr = existing.slice(0, n);
        while (arr.length < n) arr.push(defaultOpt(item.keyCount));
        next[id] = arr;
      });
      return next;
    });
  }, [qty]);

  const updateOpt = (itemId: string, idx: number, patch: Partial<CustomOpt>) => {
    setCustomOpts((prev) => {
      const arr = [...(prev[itemId] || [])];
      if (!arr[idx]) return prev;
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, [itemId]: arr };
    });
  };

  const updateKeycap = (itemId: string, idx: number, keyIdx: number, color: SkcsKeycap) => {
    setCustomOpts((prev) => {
      const arr = [...(prev[itemId] || [])];
      if (!arr[idx]) return prev;
      const keycaps = [...arr[idx].keycaps];
      keycaps[keyIdx] = color;
      arr[idx] = { ...arr[idx], keycaps };
      return { ...prev, [itemId]: arr };
    });
  };

  const proceedToPayment = () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 적어주세요!");
      return;
    }
    if (itemCount === 0) {
      toast.error("메뉴를 하나 이상 선택해주세요!");
      return;
    }
    setStage("payment");
  };

  const submitOrder = async (method: "cash" | "transfer") => {
    setSubmitting(true);
    const code = encodeSkcsOrderCode(qty);
    const items = SKCS_ITEM_ORDER.filter((it) => (qty[it.id] || 0) > 0).map((it) => {
      const base = {
        id: it.id,
        name: it.name,
        qty: qty[it.id] || 0,
        price: it.price,
      };
      if (CUSTOM_ITEM_IDS.includes(it.id) && customOpts[it.id]) {
        return {
          ...base,
          custom_options: customOpts[it.id].map((o) => ({
            base: o.base,
            switch: o.switchType,
            switch_name: SKCS_SWITCH_OPTIONS.find((s) => s.id === o.switchType)?.name,
            ring: o.ring,
            keycaps: o.keycaps,
          })),
        };
      }
      return base;
    });

    const { data, error } = await supabase
      .from("orders")
      .insert({
        nickname: nickname.trim(),
        items,
        total,
        is_member: false,
        no_relish: false,
        member_phrase: null,
        payment_method: method,
        payment_code: code,
        paid: false,
        booth: "skcs",
      })
      .select("id, created_at")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error("주문 실패. 다시 시도해주세요.");
      return;
    }
    setPaymentCode(code);
    setOrderId(data.id);
    setOrderCreatedAt(data.created_at as string);
    if (method === "cash") {
      setStage("done");
    } else {
      setStage("bank-pending");
    }
  };

  const confirmTransferred = () => setStage("done");

  const reset = () => {
    setQty({});
    setCustomOpts({});
    setNickname("");
    setStage("cart");
    setPaymentCode(null);
    setOrderId(null);
    setOrderCreatedAt(null);
    setQueueAhead(null);
    setElapsedSec(0);
  };

  // Queue position (only count SKCS booth orders ahead).
  useEffect(() => {
    if (stage !== "done" || !orderCreatedAt) return;
    let cancelled = false;
    const fetchQueue = async () => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("booth", "skcs")
        .eq("status", "pending")
        .eq("paid", true)
        .lt("created_at", orderCreatedAt);
      if (!cancelled) setQueueAhead(count ?? 0);
    };
    fetchQueue();
    const iv = window.setInterval(fetchQueue, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, [stage, orderCreatedAt]);

  useEffect(() => {
    if (stage !== "done" || !orderCreatedAt) return;
    const start = new Date(orderCreatedAt).getTime();
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const iv = window.setInterval(tick, 1000);
    return () => window.clearInterval(iv);
  }, [stage, orderCreatedAt]);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.account.replace(/-/g, ""));
      toast.success("계좌번호가 복사되었어요!");
    } catch {
      toast.error("복사 실패. 직접 입력해주세요.");
    }
  };

  /* DONE — show QR */
  if (stage === "done" && paymentCode) {
    return (
      <div className="show-cursor min-h-screen bg-sky-50 text-slate-900 px-5 py-8 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="w-full max-w-md bg-white border border-sky-200 rounded-3xl shadow-xl p-6 text-center"
        >
          <div className="text-3xl mb-1">🔑</div>
          <h1 className="text-2xl font-extrabold mb-2 text-sky-600">주문 완료!</h1>
          <p className="text-sm text-slate-900 mb-5">아래 QR을 직원에게 보여주세요</p>
          <div className="bg-white p-4 rounded-2xl border-4 border-sky-500 inline-block">
            <QRCodeSVG value={paymentCode} size={220} level="M" />
          </div>
          <div className="mt-3 font-mono text-xs text-slate-900 break-all">{paymentCode}</div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mt-5 bg-sky-500/10 border-2 border-sky-500/40 rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">예상 대기 시간</div>
                <div className="text-3xl font-extrabold text-sky-700 mt-0.5">
                  {queueAhead === null ? "…" : `약 ${queueAhead * 2}분`}
                </div>
                <div className="text-xs text-slate-900 mt-1">
                  {queueAhead === null
                    ? "대기열을 확인하는 중…"
                    : queueAhead === 0
                      ? "지금 바로 만들고 있어요!"
                      : `앞에 ${queueAhead}건 대기 중 · 1건당 약 2분`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">경과</div>
                <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:{String(elapsedSec % 60).padStart(2, "0")}
                </div>
              </div>
            </div>
          </motion.div>
          <div className="mt-5 text-left bg-sky-100 rounded-2xl p-4 text-sm">
            <div className="font-bold mb-1 text-slate-900">닉네임</div>
            <div className="mb-2">{nickname}</div>
            <div className="font-bold mb-1 text-slate-900">합계</div>
            <div className="text-sky-700 font-extrabold">₩{total.toLocaleString()}</div>
            {orderId && (
              <>
                <div className="font-bold mt-2 mb-1 text-slate-900">주문번호</div>
                <div className="font-mono text-xs break-all">{orderId}</div>
              </>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={reset}
            className="mt-5 w-full bg-sky-500 text-white font-bold py-3 rounded-full"
          >
            새 주문
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* CART */
  return (
    <div className="show-cursor min-h-screen bg-sky-50 text-slate-900 pb-32">
      <header className="px-5 pt-6 pb-3 sticky top-0 bg-sky-50/90 backdrop-blur z-20 border-b border-sky-200">
        <h1 className="text-2xl font-extrabold tracking-tight text-sky-600">SKCS · KEYRING SHOP</h1>
        <p className="text-xs text-slate-900">Custom Mechanical Keyrings · 무료 커스터마이징</p>
      </header>

      <main className="px-5 space-y-6 mt-4">
        <Section
          title="KEYCAP CLICKER KEYRING"
          subtitle="아래에서 수량을 정하면 키링별로 색상을 골라요"
          items={SKCS_ITEM_ORDER.filter((i) => i.category === "keycap")}
          qty={qty}
          bump={bump}
          soldOut={soldOut}
        />
        <Section
          title="67 CLICKER"
          subtitle="숫자 67 모양의 한정판"
          items={SKCS_ITEM_ORDER.filter((i) => i.category === "clicker67")}
          qty={qty}
          bump={bump}
          soldOut={soldOut}
        />
        <Section
          title="NFC OREO KEYRING"
          subtitle="오레오 모양 NFC 키링 — 폰으로 스캔하면 오늘의 학점 운세!"
          items={SKCS_ITEM_ORDER.filter((i) => i.category === "nfc")}
          qty={qty}
          bump={bump}
          soldOut={soldOut}
        />

        {/* Per-keyring customization panels */}
        <AnimatePresence initial={false}>
          {CUSTOM_ITEM_IDS.flatMap((itemId) => {
            const item = SKCS_ITEM_ORDER.find((x) => x.id === itemId)!;
            const opts = customOpts[itemId] || [];
            return opts.map((opt, idx) => (
              <motion.div
                key={`${itemId}-${idx}`}
                layout
                initial={{ opacity: 0, height: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, height: "auto", y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, y: -10, scale: 0.96 }}
                transition={spring}
                className="overflow-hidden"
              >
                <div className="bg-white border border-sky-200 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-base text-sky-600">
                      🔑 {item.name} <span className="text-slate-900">#{idx + 1}</span>
                    </h2>
                    <span className="text-[10px] font-mono bg-sky-500/20 text-sky-700 px-2 py-0.5 rounded-full">
                      커스터마이징
                    </span>
                  </div>

                  <OptionGroup
                    label="Base"
                    options={SKCS_BASE_OPTIONS as readonly string[]}
                    value={opt.base}
                    onChange={(v) => updateOpt(itemId, idx, { base: v as SkcsBase })}
                  />
                  <OptionGroup
                    label="Switch"
                    options={SKCS_SWITCH_OPTIONS.map((s) => s.id) as unknown as readonly string[]}
                    labels={SKCS_SWITCH_OPTIONS.map((s) => s.name)}
                    value={opt.switchType}
                    onChange={(v) => updateOpt(itemId, idx, { switchType: v as SkcsSwitch })}
                  />
                  <OptionGroup
                    label="Ring"
                    options={SKCS_RING_OPTIONS as readonly string[]}
                    value={opt.ring}
                    onChange={(v) => updateOpt(itemId, idx, { ring: v as SkcsRing })}
                  />

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Keycap{item.keyCount > 1 ? `s (${item.keyCount}개)` : ""}
                    </div>
                    {opt.keycaps.map((kc, ki) => (
                      <div key={ki}>
                        {item.keyCount > 1 && (
                          <div className="text-[10px] text-slate-900 mb-1">키 #{ki + 1}</div>
                        )}
                        <OptionRow
                          options={SKCS_KEYCAP_OPTIONS as readonly string[]}
                          value={kc}
                          onChange={(v) => updateKeycap(itemId, idx, ki, v as SkcsKeycap)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ));
          })}
        </AnimatePresence>

        {/* nickname */}
        <div className="bg-white border border-sky-200 rounded-3xl p-5 shadow-sm">
          <label className="block font-extrabold text-lg mb-1">주문시 호명될 닉네임을 적어주세요</label>
          <p className="text-xs text-slate-900 mb-3">주문이 나왔을 때 큰 소리로 외쳐드립니다! 📣</p>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
            placeholder="예: 키링장인"
            className="w-full bg-sky-100 rounded-2xl px-4 py-3 text-base border-2 border-transparent focus:outline-none focus:border-sky-500"
          />
        </div>
      </main>

      <footer className="px-5 mt-10 text-center text-slate-900">
        <div className="text-xs font-semibold tracking-wide">SKCS · Decompiler 2026</div>
      </footer>

      {/* sticky bar */}
      <motion.div
        initial={false}
        animate={{ y: itemCount > 0 ? 0 : 100 }}
        transition={spring}
        className="fixed bottom-0 inset-x-0 px-4 pb-5 pt-3 bg-gradient-to-t from-sky-50 via-sky-50/95 to-transparent z-30"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={submitting}
          onClick={proceedToPayment}
          className="w-full bg-sky-500 text-white rounded-full py-4 font-extrabold flex items-center justify-between px-6 shadow-lg disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            <span className="bg-sky-50 text-sky-600 rounded-full px-2 py-0.5 text-xs">{itemCount}</span>
            결제하기
          </span>
          <span>₩{total.toLocaleString()}</span>
        </motion.button>
      </motion.div>

      {/* PAYMENT METHOD MODAL */}
      <AnimatePresence>
        {stage === "payment" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setStage("cart")}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white border border-sky-200 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-sky-200 rounded-full mx-auto mb-4 sm:hidden" />
              <h2 className="text-2xl font-extrabold mb-1">결제 방법 선택</h2>
              <p className="text-sm text-slate-900 mb-5">
                합계 <span className="font-bold text-sky-600">₩{total.toLocaleString()}</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={submitting}
                  onClick={() => submitOrder("cash")}
                  className="bg-sky-100 text-slate-900 rounded-2xl py-5 font-extrabold flex flex-col items-center gap-1 disabled:opacity-50 border border-sky-200"
                >
                  <span className="text-2xl">💵</span>
                  현금 결제
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={submitting}
                  onClick={() => submitOrder("transfer")}
                  className="bg-sky-500 text-white rounded-2xl py-5 font-extrabold flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <span className="text-2xl">🏦</span>
                  입금 결제
                </motion.button>
              </div>
              <button onClick={() => setStage("cart")} className="mt-4 w-full text-sm text-slate-900 py-2">
                돌아가기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BANK TRANSFER MODAL */}
      <AnimatePresence>
        {stage === "bank-pending" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={spring}
              className="w-full sm:max-w-md bg-white border border-sky-200 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-sky-200 rounded-full mx-auto mb-4 sm:hidden" />
              <h2 className="text-2xl font-extrabold mb-1">🏦 계좌 입금</h2>
              <p className="text-sm text-slate-900 mb-5">아래 계좌로 입금 후 체크해주세요</p>

              <div className="bg-sky-500/10 border-2 border-sky-500/40 rounded-2xl p-5 space-y-3">
                <button type="button" onClick={copyAccount} className="w-full text-left active:scale-[0.98] transition">
                  <div className="text-xs font-bold text-sky-600 flex items-center justify-between">
                    <span>은행 / 계좌번호</span>
                    <span className="text-[10px] bg-sky-500/30 text-sky-700 px-2 py-0.5 rounded-full">
                      탭하여 복사 📋
                    </span>
                  </div>
                  <div className="font-mono font-bold text-lg select-all break-all text-slate-900">
                    {BANK_INFO.bank} {BANK_INFO.account}
                  </div>
                </button>
                <div>
                  <div className="text-xs font-bold text-sky-600">예금주</div>
                  <div className="font-bold text-lg">{BANK_INFO.holder}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-600">입금 금액</div>
                  <div className="font-extrabold text-2xl text-sky-700">₩{total.toLocaleString()}</div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={confirmTransferred}
                className="mt-5 w-full bg-sky-500 text-white rounded-full py-4 font-extrabold flex items-center justify-center gap-2"
              >
                <span className="w-5 h-5 rounded border-2 border-sky-300 flex items-center justify-center text-xs">
                  ✓
                </span>
                입금했습니다
              </motion.button>
              <button
                onClick={() => setStage("payment")}
                className="mt-2 w-full text-sm text-slate-900 py-2"
              >
                결제 방법 다시 선택
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({
  title,
  subtitle,
  items,
  qty,
  bump,
  soldOut,
}: {
  title: string;
  subtitle?: string;
  items: typeof SKCS_ITEM_ORDER;
  qty: Record<string, number>;
  bump: (id: string, d: number) => void;
  soldOut: Set<string>;
}) {
  return (
    <section className="bg-white border border-sky-200 rounded-3xl p-5 shadow-sm">
      <h2 className="font-extrabold text-lg text-sky-600">{title}</h2>
      {subtitle && <p className="text-xs text-slate-900 mb-3">{subtitle}</p>}
      <ul className="divide-y divide-sky-200">
        {items.map((it) => {
          const n = qty[it.id] || 0;
          const out = soldOut.has(it.id);
          return (
            <li key={it.id} className={`flex items-center justify-between py-3 ${out ? "opacity-50" : ""}`}>
              <div className="flex-1">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span className={out ? "line-through" : ""}>{it.name}</span>
                  {out && (
                    <span className="text-[10px] font-bold bg-red-500/30 text-red-200 px-2 py-0.5 rounded-full">
                      품절
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-900">₩{it.price.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => bump(it.id, -1)}
                  disabled={out}
                  className="w-9 h-9 rounded-full bg-sky-100 font-bold text-lg active:bg-sky-200 disabled:opacity-40"
                >
                  −
                </motion.button>
                <motion.span
                  key={n}
                  initial={{ scale: 1.4, color: "#0ea5e9" }}
                  animate={{ scale: 1, color: "#0f172a" }}
                  transition={spring}
                  className="w-6 text-center font-bold tabular-nums"
                >
                  {n}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => !out && bump(it.id, 1)}
                  disabled={out}
                  className="w-9 h-9 rounded-full bg-sky-500 text-white font-bold text-lg shadow active:bg-sky-600 disabled:bg-sky-200 disabled:cursor-not-allowed"
                >
                  +
                </motion.button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function OptionGroup({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  labels?: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">{label}</div>
      <OptionRow options={options} labels={labels} value={value} onChange={onChange} />
    </div>
  );
}

function OptionRow({
  options,
  labels,
  value,
  onChange,
}: {
  options: readonly string[];
  labels?: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt, i) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition active:scale-95 ${
              active
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-sky-100 text-slate-900 border-sky-200"
            }`}
          >
            {labels?.[i] ?? opt}
          </button>
        );
      })}
    </div>
  );
}
