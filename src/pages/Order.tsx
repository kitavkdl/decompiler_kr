import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import menuImg from "@/assets/menu.png";

type Item = { id: string; name: string; price: number; group: "single" | "combo" };

const SINGLE: Item[] = [
  { id: "hotdog", name: "Hot Dog", price: 5000, group: "single" },
  { id: "popcorn", name: "Popcorn", price: 1000, group: "single" },
  { id: "grape", name: "Green Grape Ade", price: 3000, group: "single" },
  { id: "lemon", name: "Lemon Ade", price: 3000, group: "single" },
  { id: "icetea", name: "Iced Tea", price: 2000, group: "single" },
];
const COMBO: Item[] = [
  { id: "setA", name: "Set A: Iced Tea + Hotdog", price: 6000, group: "combo" },
  { id: "setB", name: "Set B: Ade + Hotdog", price: 7000, group: "combo" },
  { id: "setC", name: "Set C: Icetea + Hotdog + Keycap", price: 10000, group: "combo" },
];
const ADDONS: Item[] = [
  { id: "cheese_buldak", name: "Cheese + Buldak Sauce", price: 500, group: "single" },
  { id: "cheese", name: "Cheese Only", price: 500, group: "single" },
  { id: "buldak", name: "Buldak Sauce Only", price: 500, group: "single" },
];

const spring = { type: "spring" as const, stiffness: 380, damping: 18 };

export default function Order() {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [nickname, setNickname] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [noRelish, setNoRelish] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const all = [...SINGLE, ...COMBO, ...ADDONS];
  const total = useMemo(
    () => all.reduce((s, it) => s + (qty[it.id] || 0) * it.price, 0),
    [qty]
  );
  const itemCount = Object.values(qty).reduce((a, b) => a + b, 0);

  const bump = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + d) }));

  const submit = async () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 적어주세요!");
      return;
    }
    if (itemCount === 0) {
      toast.error("메뉴를 하나 이상 선택해주세요!");
      return;
    }
    setSubmitting(true);
    const items = all
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
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error("주문 실패. 다시 시도해주세요.");
      return;
    }
    setSubmitted(data.id);
  };

  const reset = () => {
    setQty({});
    setNickname("");
    setIsMember(false);
    setNoRelish(false);
    setPhrase("");
    setSubmitted(null);
  };

  if (submitted) {
    const url = `${window.location.origin}/whatisorder?id=${submitted}`;
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
            <QRCodeSVG value={url} size={220} level="M" />
          </div>
          <div className="mt-5 text-left bg-orange-50 rounded-2xl p-4 text-sm">
            <div className="font-bold mb-1">닉네임</div>
            <div className="mb-2">{nickname}</div>
            <div className="font-bold mb-1">주문번호</div>
            <div className="font-mono text-xs break-all">{submitted}</div>
            <div className="font-bold mt-2 mb-1">합계</div>
            <div>₩{total.toLocaleString()}</div>
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
          onClick={submit}
          className="w-full bg-stone-900 text-white rounded-full py-4 font-extrabold flex items-center justify-between px-6 shadow-lg disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            <span className="bg-orange-400 text-stone-900 rounded-full px-2 py-0.5 text-xs">
              {itemCount}
            </span>
            주문하기
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
  items: Item[];
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
