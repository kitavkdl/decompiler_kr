import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import menuImg from "@/assets/menu.png";
import { ITEM_ORDER, encodeOrderCode } from "@/lib/orderCodec";
import StaffConfirmModal from "@/components/StaffConfirmModal";

import { useSoldOut } from "@/lib/soldOut";

type MenuRow = (typeof ITEM_ORDER)[number];

const SINGLE: MenuRow[] = ITEM_ORDER.filter((i) => i.group === "single");
const COMBO: MenuRow[] = ITEM_ORDER.filter((i) => i.group === "combo");
const ADDONS: MenuRow[] = ITEM_ORDER.filter((i) => i.group === "addon");
const ADDON_IDS = ADDONS.map((a) => a.id);

// Items that include a hotdog — selecting any of these reveals the addon panel.
const HOTDOG_ITEM_IDS = ITEM_ORDER.filter((i) => i.categories.includes("hotdog")).map((i) => i.id);

// Items where the customer must pick which ade flavor (lemon vs green grape).
// setB is "Ade + Hotdog" without a specific flavor — the staff needs to know which.
// grape / lemon singles are explicit already but the user wants the same per-unit popup for consistency.
const ADE_ITEM_IDS = ["grape", "lemon", "setB"] as const;
type AdeFlavor = "grape" | "lemon";
const ADE_FLAVORS: { id: AdeFlavor; name: string; emoji: string }[] = [
  { id: "grape", name: "청포도 에이드", emoji: "🍇" },
  { id: "lemon", name: "레몬 에이드", emoji: "🍋" },
];
const ADE_DEFAULT: Record<string, AdeFlavor | null> = {
  grape: "grape",
  lemon: "lemon",
  setB: null,
};

const BANK_INFO = {
  bank: "토스뱅크",
  account: "1002-4730-0262",
  holder: "최원석",
};

const spring = { type: "spring" as const, stiffness: 380, damping: 18 };

type Stage = "cart" | "payment" | "bank-pending" | "done";

type HotdogOpt = { noRelish: boolean; addon: string | null };
type AdeOpt = { flavor: AdeFlavor | null };

export default function Order() {
  // Quantity for non-addon items only. Addon qty is derived from per-hotdog options.
  const [qty, setQty] = useState<Record<string, number>>({});
  // Per-hotdog (per unit) options, keyed by hotdog-containing item id.
  const [hotdogOpts, setHotdogOpts] = useState<Record<string, HotdogOpt[]>>({});
  // Per-ade-unit flavor selections, keyed by ade-containing item id.
  const [adeOpts, setAdeOpts] = useState<Record<string, AdeOpt[]>>({});
  const [nickname, setNickname] = useState("");
  const [isMember, setIsMember] = useState(false);
  const MEMBER_PHRASE = "6463";
  const [phrase, setPhrase] = useState("");
  const [memberOpen, setMemberOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const soldOut = useSoldOut();

  const [stage, setStage] = useState<Stage>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCreatedAt, setOrderCreatedAt] = useState<string | null>(null);
  const [queueAhead, setQueueAhead] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [staffConfirmOpen, setStaffConfirmOpen] = useState(false);
  const [orderFulfilled, setOrderFulfilled] = useState(false);

  // Aggregate addon counts derived from per-hotdog selections.
  const addonCounts = useMemo(() => {
    const c: Record<string, number> = {};
    ADDON_IDS.forEach((id) => (c[id] = 0));
    Object.values(hotdogOpts)
      .flat()
      .forEach((opt) => {
        if (opt.addon) c[opt.addon] = (c[opt.addon] || 0) + 1;
      });
    return c;
  }, [hotdogOpts]);

  const subtotal = useMemo(
    () => ITEM_ORDER.filter((it) => it.group !== "addon").reduce((s, it) => s + (qty[it.id] || 0) * it.price, 0),
    [qty],
  );
  const addonTotal = useMemo(() => ADDONS.reduce((s, a) => s + (addonCounts[a.id] || 0) * a.price, 0), [addonCounts]);
  const memberDiscount = isMember ? addonTotal : 0;
  const total = subtotal + addonTotal - memberDiscount;
  const itemCount = Object.values(qty).reduce((a, b) => a + b, 0);
  const hotdogCount = HOTDOG_ITEM_IDS.reduce((s, id) => s + (qty[id] || 0), 0);

  const bump = (id: string, d: number) => {
    // Block direct bumping of addons — they are picked per hotdog now.
    if (ADDON_IDS.includes(id)) return;
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + d) }));
  };

  // Keep hotdogOpts arrays in sync with qty for hotdog-containing items.
  useEffect(() => {
    setHotdogOpts((prev) => {
      const next: Record<string, HotdogOpt[]> = {};
      HOTDOG_ITEM_IDS.forEach((id) => {
        const n = qty[id] || 0;
        if (n === 0) return;
        const existing = prev[id] || [];
        const arr = existing.slice(0, n);
        while (arr.length < n) arr.push({ noRelish: false, addon: null });
        next[id] = arr;
      });
      return next;
    });
  }, [qty]);

  // Keep adeOpts arrays in sync with qty for ade-containing items.
  useEffect(() => {
    setAdeOpts((prev) => {
      const next: Record<string, AdeOpt[]> = {};
      ADE_ITEM_IDS.forEach((id) => {
        const n = qty[id] || 0;
        if (n === 0) return;
        const existing = prev[id] || [];
        const arr = existing.slice(0, n);
        while (arr.length < n) arr.push({ flavor: ADE_DEFAULT[id] ?? null });
        next[id] = arr;
      });
      return next;
    });
  }, [qty]);

  const updateOpt = (itemId: string, idx: number, patch: Partial<HotdogOpt>) => {
    setHotdogOpts((prev) => {
      const arr = [...(prev[itemId] || [])];
      if (!arr[idx]) return prev;
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, [itemId]: arr };
    });
  };

  const updateAde = (itemId: string, idx: number, flavor: AdeFlavor) => {
    setAdeOpts((prev) => {
      const arr = [...(prev[itemId] || [])];
      if (!arr[idx]) return prev;
      arr[idx] = { flavor };
      return { ...prev, [itemId]: arr };
    });
  };

  // Member status auto-derives from secret phrase.
  useEffect(() => {
    setIsMember(phrase.trim() === MEMBER_PHRASE);
  }, [phrase]);

  const proceedToPayment = () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 적어주세요!");
      return;
    }
    if (itemCount === 0) {
      toast.error("메뉴를 하나 이상 선택해주세요!");
      return;
    }
    // Require an ade flavor for every ade unit.
    for (const id of ADE_ITEM_IDS) {
      const arr = adeOpts[id] || [];
      if (arr.some((a) => !a.flavor)) {
        toast.error("에이드 맛(레몬/청포도)을 선택해주세요!");
        return;
      }
    }
    setStage("payment");
  };

  const submitOrder = async (method: "cash" | "transfer") => {
    setSubmitting(true);
    // Combine non-addon qty with derived addon qty for the QR codec.
    const fullQty: Record<string, number> = { ...qty, ...addonCounts };
    const code = encodeOrderCode(fullQty);
    const items = ITEM_ORDER.filter((it) => (fullQty[it.id] || 0) > 0).map((it) => {
      const base = {
        id: it.id,
        name: it.name,
        qty: fullQty[it.id] || 0,
        price: it.price,
      };
      if (HOTDOG_ITEM_IDS.includes(it.id) && hotdogOpts[it.id]) {
        return {
          ...base,
          hotdog_options: hotdogOpts[it.id].map((o) => ({
            no_relish: o.noRelish,
            addon: o.addon,
            addon_name: o.addon ? (ITEM_ORDER.find((x) => x.id === o.addon)?.name ?? null) : null,
          })),
          ...(adeOpts[it.id]
            ? {
                ade_options: adeOpts[it.id].map((a) => ({
                  flavor: a.flavor,
                  flavor_name: a.flavor ? ADE_FLAVORS.find((f) => f.id === a.flavor)?.name : null,
                })),
              }
            : {}),
        };
      }
      if (adeOpts[it.id]) {
        return {
          ...base,
          ade_options: adeOpts[it.id].map((a) => ({
            flavor: a.flavor,
            flavor_name: a.flavor ? ADE_FLAVORS.find((f) => f.id === a.flavor)?.name : null,
          })),
        };
      }
      return base;
    });
    const anyNoRelish = Object.values(hotdogOpts)
      .flat()
      .some((o) => o.noRelish);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        nickname: nickname.trim(),
        items,
        total,
        is_member: isMember,
        no_relish: anyNoRelish,
        member_phrase: isMember ? phrase.trim() || null : null,
        payment_method: method,
        payment_code: code,
        paid: false,
        booth: "decompiler",
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
    // Both cash and bank: staff must scan QR to mark as paid → only then it appears on dashboard.
    if (method === "cash") {
      // Cash: ask user to confirm staff received cash before showing QR.
      setStaffConfirmOpen(true);
    } else {
      setStage("bank-pending");
    }
  };

  const confirmTransferred = () => {
    // Ask user to confirm staff verified the transfer before showing QR.
    setStaffConfirmOpen(true);
  };

  const handleStaffConfirmed = () => {
    setStaffConfirmOpen(false);
    setStage("done");
  };

  const reset = () => {
    setQty({});
    setHotdogOpts({});
    setAdeOpts({});
    setNickname("");
    setIsMember(false);
    setPhrase("");
    setMemberOpen(false);
    setStage("cart");
    setPaymentCode(null);
    setOrderId(null);
    setOrderCreatedAt(null);
    setQueueAhead(null);
    setElapsedSec(0);
    setOrderFulfilled(false);
  };

  // Compute queue position + own status when QR is shown, refresh every 15s.
  useEffect(() => {
    if (stage !== "done" || !orderCreatedAt) return;
    let cancelled = false;
    const fetchQueue = async () => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("paid", true)
        .lt("created_at", orderCreatedAt);
      if (!cancelled) setQueueAhead(count ?? 0);
    };
    const fetchOwnStatus = async () => {
      if (!orderId) return;
      const { data } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
      if (!cancelled && data?.status === "done") setOrderFulfilled(true);
    };
    fetchQueue();
    fetchOwnStatus();
    const iv = window.setInterval(() => {
      fetchQueue();
      fetchOwnStatus();
    }, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, [stage, orderCreatedAt, orderId]);

  // Elapsed timer from when order is placed. Stops once the order is fulfilled.
  useEffect(() => {
    if (stage !== "done" || !orderCreatedAt) return;
    const start = new Date(orderCreatedAt).getTime();
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    if (orderFulfilled) return; // freeze
    const iv = window.setInterval(tick, 1000);
    return () => window.clearInterval(iv);
  }, [stage, orderCreatedAt, orderFulfilled]);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.account.replace(/-/g, ""));
      toast.success("계좌번호가 복사되었어요!");
    } catch {
      toast.error("복사 실패. 직접 입력해주세요.");
    }
  };

  /* =========================================================
     STAGE: DONE — show QR
     ========================================================= */
  if (stage === "done" && paymentCode) {
    return (
      <div className="show-cursor min-h-screen bg-orange-50 text-stone-900 px-5 py-8 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 text-center"
        >
          <div className="text-3xl mb-1">🌭</div>
          <h1 className="text-2xl font-extrabold mb-2">주문 완료!</h1>
          <p className="text-sm text-stone-600 mb-5">아래 QR을 직원에게 보여주세요</p>
          <div className="bg-white p-4 rounded-2xl border-4 border-orange-400 inline-block">
            <QRCodeSVG value={paymentCode} size={220} level="M" />
          </div>
          <div className="mt-3 font-mono text-xs text-stone-500 break-all">{paymentCode}</div>

          {/* Queue / wait estimate */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mt-5 bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-300 rounded-2xl p-4 text-left"
          >
            {orderFulfilled ? (
              <div className="text-center py-1">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">제공 완료</div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">🎉 픽업 완료!</div>
                <div className="text-xs text-stone-600 mt-1">맛있게 드세요 :)</div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">예상 대기 시간</div>
                  <div className="text-3xl font-extrabold text-orange-600 mt-0.5">
                    {queueAhead === null ? "…" : `약 ${queueAhead}분`}
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    {queueAhead === null
                      ? "대기열을 확인하는 중…"
                      : queueAhead === 0
                        ? "지금 바로 만들고 있어요!"
                        : `앞에 ${queueAhead}건 대기 중 · 1건당 약 1분`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">경과</div>
                  <div className="text-2xl font-extrabold font-mono text-stone-900 tabular-nums">
                    {String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:
                    {String(elapsedSec % 60).padStart(2, "0")}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          <div className="mt-5 text-left bg-orange-50 rounded-2xl p-4 text-sm">
            <div className="font-bold mb-1">닉네임</div>
            <div className="mb-2">{nickname}</div>
            <div className="font-bold mb-1">합계</div>
            <div>₩{total.toLocaleString()}</div>
            {orderId && (
              <>
                <div className="font-bold mt-2 mb-1">주문번호</div>
                <div className="font-mono text-xs break-all">{orderId}</div>
              </>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={reset}
            className="mt-5 w-full bg-stone-900 text-white font-bold py-3 rounded-full"
          >
            새 주문
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* =========================================================
     STAGE: CART — main menu / form
     ========================================================= */
  return (
    <div className="show-cursor min-h-screen bg-orange-50 text-stone-900 pb-32">
      {/* header */}
      <header className="px-5 pt-6 pb-3 flex items-center justify-between sticky top-0 bg-orange-50/90 backdrop-blur z-20">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">SPECIAL HOTDOG DAY</h1>
          <p className="text-xs text-stone-500">Hot &amp; Fresh · Decompiler</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMenu(true)}
            className="text-xs font-bold bg-stone-900 text-white px-3 py-2 rounded-full active:scale-95 transition"
          >
            메뉴판
          </button>
        </div>
      </header>

      <main className="px-5 space-y-6 mt-2">
        <Section title="SINGLE MENU" items={SINGLE} qty={qty} bump={bump} soldOut={soldOut} />
        <Section title="COMBO" items={COMBO} qty={qty} bump={bump} soldOut={soldOut} />

        {/* Per-hotdog option panels — one per unit. */}
        <AnimatePresence initial={false}>
          {HOTDOG_ITEM_IDS.flatMap((itemId) => {
            const item = ITEM_ORDER.find((x) => x.id === itemId)!;
            const opts = hotdogOpts[itemId] || [];
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
                <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-base text-orange-600">
                      🌭 {item.name} <span className="text-stone-400">#{idx + 1}</span>
                    </h2>
                    <span className="text-[10px] font-mono bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      옵션
                    </span>
                  </div>

                  <BouncyCheck
                    checked={opt.noRelish}
                    onChange={(v) => updateOpt(itemId, idx, { noRelish: v })}
                    label="렐리쉬 피클 제거(선택) / Remove Pickles (Optional)"
                  />

                  <div className="border-t border-stone-100 pt-3 space-y-3">
                    <p className="text-xs text-stone-500">
                      소스 / 토핑은 하나만 선택할 수 있어요(선택사항/Optional) · 각 ₩500
                    </p>
                    {ADDONS.map((a) => (
                      <BouncyCheck
                        key={a.id}
                        checked={opt.addon === a.id}
                        onChange={(v) => updateOpt(itemId, idx, { addon: v ? a.id : null })}
                        label={`${a.name} (+₩${a.price.toLocaleString()})`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ));
          })}
        </AnimatePresence>

        {/* Per-ade-unit flavor selection panels — one per ade unit. */}
        <AnimatePresence initial={false}>
          {ADE_ITEM_IDS.flatMap((itemId) => {
            const item = ITEM_ORDER.find((x) => x.id === itemId);
            if (!item) return [];
            const opts = adeOpts[itemId] || [];
            return opts.map((opt, idx) => (
              <motion.div
                key={`ade-${itemId}-${idx}`}
                layout
                initial={{ opacity: 0, height: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, height: "auto", y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, y: -10, scale: 0.96 }}
                transition={spring}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-base text-sky-600">
                      🥤 {item.name} <span className="text-stone-400">#{idx + 1}</span>
                    </h2>
                    <span className="text-[10px] font-mono bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                      에이드 맛 선택
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    어떤 에이드를 드릴까요? (필수 / Required)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {ADE_FLAVORS.map((f) => {
                      const active = opt.flavor === f.id;
                      return (
                        <motion.button
                          key={f.id}
                          type="button"
                          whileTap={{ scale: 0.94 }}
                          onClick={() => updateAde(itemId, idx, f.id)}
                          className={`rounded-2xl py-3 px-3 font-bold text-sm border-2 transition flex flex-col items-center gap-1 ${
                            active
                              ? "bg-sky-500 text-white border-sky-500 shadow"
                              : "bg-stone-50 text-stone-700 border-transparent"
                          }`}
                        >
                          <span className="text-2xl">{f.emoji}</span>
                          {f.name}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ));
          })}
        </AnimatePresence>

        {/* membership — checkbox opens masked phrase input */}
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
          <BouncyCheck
            checked={memberOpen}
            onChange={(v) => {
              setMemberOpen(v);
              if (!v) setPhrase("");
            }}
            label="디컴파일러 회원인가요?"
          />

          <AnimatePresence initial={false}>
            {memberOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={spring}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    🔒 임원이 손님의 비밀문구를 듣고 직접 입력합니다.
                    <br />
                    인증되면 추가하신 모든 소스/토핑 금액이 할인돼요.
                  </p>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    placeholder="● ● ● ●"
                    className={`w-full rounded-xl px-3 py-3 text-center text-2xl font-bold tracking-[0.6em] border-2 focus:outline-none transition-colors ${
                      isMember
                        ? "bg-orange-50 border-orange-400 text-orange-900"
                        : "bg-stone-50 border-transparent focus:border-orange-300"
                    }`}
                  />

                  <AnimatePresence initial={false}>
                    {isMember && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={spring}
                        className="overflow-hidden"
                      >
                        <div className="bg-orange-100 rounded-2xl p-4 border border-orange-300">
                          <p className="text-sm font-bold text-orange-900 leading-relaxed">
                            ✅ 디컴파일러 회원 인증 완료!
                          </p>
                          <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                            추가하신 모든 소스 / 토핑 금액이 총 합계에서 자동 할인됩니다.
                          </p>
                          {addonTotal > 0 && (
                            <div className="mt-2 flex items-center justify-between bg-white rounded-xl px-3 py-2">
                              <span className="text-xs font-semibold text-stone-600">회원 할인</span>
                              <span className="font-extrabold text-orange-600">−₩{addonTotal.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* nickname */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <label className="block font-extrabold text-lg mb-1">주문시 호명될 닉네임을 적어주세요</label>
          <p className="text-xs text-stone-500 mb-3">주문이 나왔을 때 저희가 큰 소리로 외쳐드립니다! 📣</p>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
            placeholder="예: 핫도그야르"
            className="w-full bg-orange-50 rounded-2xl px-4 py-3 text-base border-2 border-transparent focus:outline-none focus:border-orange-400"
          />
        </div>
      </main>

      <footer className="px-5 mt-10 text-center text-stone-400">
        <div className="text-xs font-semibold tracking-wide">Decompiler — Since 2020</div>
        <a
          href="mailto:jiyul.ahn@stonybrook.edu"
          className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
        >
          jiyul.ahn@stonybrook.edu
        </a>
      </footer>

      
      {/* sticky bar */}
      <motion.div
        initial={false}
        animate={{ y: itemCount > 0 ? 0 : 100 }}
        transition={spring}
        className="fixed bottom-0 inset-x-0 px-4 pb-5 pt-3 bg-gradient-to-t from-orange-50 via-orange-50/95 to-transparent z-30"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={submitting}
          onClick={proceedToPayment}
          className="w-full bg-stone-900 text-white rounded-full py-4 font-extrabold flex items-center justify-between px-6 shadow-lg disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            <span className="bg-orange-400 text-stone-900 rounded-full px-2 py-0.5 text-xs">{itemCount}</span>
            결제하기
          </span>
          <span>₩{total.toLocaleString()}</span>
        </motion.button>
      </motion.div>

      {/* menu lightbox */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={spring}
              src={menuImg}
              alt="메뉴판"
              className="max-w-full max-h-full rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAYMENT METHOD MODAL */}
      <AnimatePresence>
        {stage === "payment" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setStage("cart")}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-4 sm:hidden" />
              <h2 className="text-2xl font-extrabold mb-1">결제 방법 선택</h2>
              <p className="text-sm text-stone-500 mb-5">
                합계 <span className="font-bold text-orange-600">₩{total.toLocaleString()}</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={submitting}
                  onClick={() => submitOrder("cash")}
                  className="bg-stone-900 text-white rounded-2xl py-5 font-extrabold flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <span className="text-2xl">💵</span>
                  현금 결제
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={submitting}
                  onClick={() => submitOrder("transfer")}
                  className="bg-orange-500 text-white rounded-2xl py-5 font-extrabold flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <span className="text-2xl">🏦</span>
                  입금 결제
                </motion.button>
              </div>
              <button onClick={() => setStage("cart")} className="mt-4 w-full text-sm text-stone-500 py-2">
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
            className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={spring}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-4 sm:hidden" />
              <h2 className="text-2xl font-extrabold mb-1">🏦 계좌 입금</h2>
              <p className="text-sm text-stone-500 mb-5">아래 계좌로 입금 후 체크해주세요</p>

              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5 space-y-3">
                <button type="button" onClick={copyAccount} className="w-full text-left active:scale-[0.98] transition">
                  <div className="text-xs font-bold text-orange-700 flex items-center justify-between">
                    <span>은행 / 계좌번호</span>
                    <span className="text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
                      탭하여 복사 📋
                    </span>
                  </div>
                  <div className="font-mono font-bold text-lg select-all break-all">
                    {BANK_INFO.bank} {BANK_INFO.account}
                  </div>
                </button>
                <div>
                  <div className="text-xs font-bold text-orange-700">예금주</div>
                  <div className="font-bold text-lg">{BANK_INFO.holder}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-700">입금 금액</div>
                  <div className="font-extrabold text-2xl text-orange-600">₩{total.toLocaleString()}</div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={confirmTransferred}
                className="mt-5 w-full bg-stone-900 text-white rounded-full py-4 font-extrabold flex items-center justify-center gap-2"
              >
                <span className="w-5 h-5 rounded border-2 border-white flex items-center justify-center text-xs">
                  ✓
                </span>
                입금했습니다
              </motion.button>
              <button
                onClick={() => {
                  setStage("payment");
                }}
                className="mt-2 w-full text-sm text-stone-500 py-2"
              >
                결제 방법 다시 선택
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StaffConfirmModal
        open={staffConfirmOpen}
        onConfirm={handleStaffConfirmed}
        onCancel={() => setStaffConfirmOpen(false)}
        theme="decompiler"
      />
    </div>
  );
}

function Section({
  title,
  items,
  qty,
  bump,
  soldOut,
}: {
  title: string;
  items: MenuRow[];
  qty: Record<string, number>;
  bump: (id: string, d: number) => void;
  soldOut: Set<string>;
}) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm">
      <h2 className="font-extrabold text-lg mb-3 text-orange-600">{title}</h2>
      <ul className="divide-y divide-stone-100">
        {items.map((it) => {
          const n = qty[it.id] || 0;
          const out = soldOut.has(it.id);
          return (
            <li
              key={it.id}
              className={`flex items-center justify-between py-3 ${out ? "opacity-50" : ""}`}
            >
              <div className="flex-1">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span className={out ? "line-through" : ""}>{it.name}</span>
                  {out && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      품절
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-500">₩{it.price.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => bump(it.id, -1)}
                  disabled={out}
                  className="w-9 h-9 rounded-full bg-stone-100 font-bold text-lg active:bg-stone-200 disabled:opacity-40"
                >
                  −
                </motion.button>
                <motion.span
                  key={n}
                  initial={{ scale: 1.4, color: "#ea580c" }}
                  animate={{ scale: 1, color: "#1c1917" }}
                  transition={spring}
                  className="w-6 text-center font-bold tabular-nums"
                >
                  {n}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => !out && bump(it.id, 1)}
                  disabled={out}
                  className="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-lg shadow active:bg-orange-600 disabled:bg-stone-300 disabled:cursor-not-allowed"
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

function BouncyCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full flex items-center gap-3 text-left">
      <motion.div
        animate={{
          backgroundColor: checked ? "#ea580c" : "#f5f5f4",
          scale: checked ? [1, 1.25, 1] : 1,
        }}
        transition={spring}
        className="w-7 h-7 rounded-lg flex items-center justify-center border-2 border-stone-300"
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={spring}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.span animate={{ x: checked ? 4 : 0 }} transition={spring} className="font-semibold">
        {label}
      </motion.span>
    </button>
  );
}
