import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import menuImg from "@/assets/menu.png";
import { ITEM_ORDER, encodeOrderCode } from "@/lib/orderCodec";

type MenuRow = (typeof ITEM_ORDER)[number];

const SINGLE: MenuRow[] = ITEM_ORDER.filter((i) => i.group === "single");
const COMBO: MenuRow[] = ITEM_ORDER.filter((i) => i.group === "combo");
const ADDONS: MenuRow[] = ITEM_ORDER.filter((i) => i.group === "addon");
const ADDON_IDS = ADDONS.map((a) => a.id);

// Items that include a hotdog — selecting any of these reveals the addon panel.
const HOTDOG_ITEM_IDS = ITEM_ORDER
  .filter((i) => i.categories.includes("hotdog"))
  .map((i) => i.id);

// TODO: 실제 디컴파일러 계좌번호로 교체하세요
const BANK_INFO = {
  bank: "OOO은행",
  account: "000-0000-0000-00",
  holder: "최원석",
};

const spring = { type: "spring" as const, stiffness: 380, damping: 18 };

type Stage = "cart" | "payment" | "bank-pending" | "done";

export default function Order() {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [nickname, setNickname] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [noRelish, setNoRelish] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const [stage, setStage] = useState<Stage>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const total = useMemo(
    () => ITEM_ORDER.reduce((s, it) => s + (qty[it.id] || 0) * it.price, 0),
    [qty]
  );
  const itemCount = Object.values(qty).reduce((a, b) => a + b, 0);

  const bump = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + d) }));

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
    const code = encodeOrderCode(qty);
    const items = ITEM_ORDER
      .filter((it) => qty[it.id])
      .map((it) => ({ id: it.id, name: it.name, qty: qty[it.id], price: it.price }));
    const { data, error } = await supabase
      .from("orders")
      .insert({
        nickname: nickname.trim(),
        items,
        total,
        is_member: isMember,
        no_relish: noRelish,
        member_phrase: isMember ? phrase.trim() || null : null,
        payment_method: method,
        payment_code: code,
        paid: false,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error("주문 실패. 다시 시도해주세요.");
      return;
    }
    setPaymentCode(code);
    setOrderId(data.id);
    if (method === "cash") {
      // For cash: mark as paid immediately so it shows on dashboard.
      await supabase.from("orders").update({ paid: true }).eq("id", data.id);
      setStage("done");
    } else {
      setStage("bank-pending");
    }
  };

  const confirmTransferred = () => {
    // Show QR — staff will scan to mark as paid.
    setStage("done");
  };

  const reset = () => {
    setQty({});
    setNickname("");
    setIsMember(false);
    setNoRelish(false);
    setPhrase("");
    setStage("cart");
    setPaymentCode(null);
    setOrderId(null);
  };

  /* =========================================================
     STAGE: DONE — show QR
     ========================================================= */
  if (stage === "done" && paymentCode) {
    return (
      <div className="min-h-screen bg-orange-50 text-stone-900 px-5 py-8 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 text-center"
        >
          <div className="text-3xl mb-1">🌭</div>
          <h1 className="text-2xl font-extrabold mb-2">주문 완료!</h1>
          <p className="text-sm text-stone-600 mb-5">
            아래 QR을 직원에게 보여주세요
          </p>
          <div className="bg-white p-4 rounded-2xl border-4 border-orange-400 inline-block">
            <QRCodeSVG value={paymentCode} size={220} level="M" />
          </div>
          <div className="mt-3 font-mono text-xs text-stone-500 break-all">
            {paymentCode}
          </div>
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
    <div className="min-h-screen bg-orange-50 text-stone-900 pb-32">
      {/* header */}
      <header className="px-5 pt-6 pb-3 flex items-center justify-between sticky top-0 bg-orange-50/90 backdrop-blur z-20">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">SPECIAL HOTDOG DAY</h1>
          <p className="text-xs text-stone-500">Hot &amp; Fresh · Decompiler</p>
        </div>
        <button
          onClick={() => setShowMenu(true)}
          className="text-xs font-bold bg-stone-900 text-white px-3 py-2 rounded-full active:scale-95 transition"
        >
          메뉴판
        </button>
      </header>

      <main className="px-5 space-y-6 mt-2">
        <Section title="SINGLE MENU" items={SINGLE} qty={qty} bump={bump} />
        <Section title="COMBO" items={COMBO} qty={qty} bump={bump} />
        <Section title="ADD-ONS (₩500)" items={ADDONS} qty={qty} bump={bump} />

        {/* options */}
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="font-extrabold text-lg">옵션</h2>

          <BouncyCheck
            checked={noRelish}
            onChange={setNoRelish}
            label="렐리쉬 피클 제거"
          />

          <BouncyCheck
            checked={isMember}
            onChange={setIsMember}
            label="디컴파일러 회원인가요?"
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
                  <p className="text-sm font-semibold text-orange-900 leading-relaxed">
                    🔥 불닭소스, 치즈토핑을 무료로 추가해드립니다.
                    <br />
                    비밀문구를 외쳐주세요!
                  </p>
                  <input
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    maxLength={60}
                    placeholder="비밀문구 (선택)"
                    className="mt-3 w-full bg-white rounded-xl px-3 py-2 text-sm border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* nickname */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <label className="block font-extrabold text-lg mb-1">
            주문시 호명될 닉네임을 적어주세요
          </label>
          <p className="text-xs text-stone-500 mb-3">
            주문이 나왔을 때 저희가 큰 소리로 외쳐드립니다! 📣
          </p>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
            placeholder="예: 핫도그러버"
            className="w-full bg-orange-50 rounded-2xl px-4 py-3 text-base border-2 border-transparent focus:outline-none focus:border-orange-400"
          />
        </div>
      </main>

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
            <span className="bg-orange-400 text-stone-900 rounded-full px-2 py-0.5 text-xs">
              {itemCount}
            </span>
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
              <button
                onClick={() => setStage("cart")}
                className="mt-4 w-full text-sm text-stone-500 py-2"
              >
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
              <p className="text-sm text-stone-500 mb-5">
                아래 계좌로 입금 후 체크해주세요
              </p>

              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5 space-y-3">
                <div>
                  <div className="text-xs font-bold text-orange-700">은행 / 계좌번호</div>
                  <div className="font-mono font-bold text-lg select-all">
                    {BANK_INFO.bank} {BANK_INFO.account}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-700">예금주</div>
                  <div className="font-bold text-lg">{BANK_INFO.holder}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-700">입금 금액</div>
                  <div className="font-extrabold text-2xl text-orange-600">
                    ₩{total.toLocaleString()}
                  </div>
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
    </div>
  );
}

function Section({
  title,
  items,
  qty,
  bump,
}: {
  title: string;
  items: MenuRow[];
  qty: Record<string, number>;
  bump: (id: string, d: number) => void;
}) {
  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm">
      <h2 className="font-extrabold text-lg mb-3 text-orange-600">{title}</h2>
      <ul className="divide-y divide-stone-100">
        {items.map((it) => {
          const n = qty[it.id] || 0;
          return (
            <li key={it.id} className="flex items-center justify-between py-3">
              <div className="flex-1">
                <div className="font-semibold text-sm">{it.name}</div>
                <div className="text-xs text-stone-500">₩{it.price.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => bump(it.id, -1)}
                  className="w-9 h-9 rounded-full bg-stone-100 font-bold text-lg active:bg-stone-200"
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
                  onClick={() => bump(it.id, 1)}
                  className="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-lg shadow active:bg-orange-600"
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
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 text-left"
    >
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
      <motion.span
        animate={{ x: checked ? 4 : 0 }}
        transition={spring}
        className="font-semibold"
      >
        {label}
      </motion.span>
    </button>
  );
}
