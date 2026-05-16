import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 380, damping: 22 };

export type StaffConfirmTheme = "decompiler" | "skcs";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  theme?: StaffConfirmTheme;
  lockSeconds?: number;
  confirmLockSeconds?: number;
}

const THEMES = {
  decompiler: {
    panel: "bg-white text-stone-900",
    accent: "bg-orange-500 hover:bg-orange-600 text-white",
    pill: "bg-orange-100 text-orange-700",
    sub: "text-stone-600",
    handle: "bg-stone-200",
  },
  skcs: {
    panel: "bg-white text-slate-900",
    accent: "bg-sky-500 hover:bg-sky-600 text-white",
    pill: "bg-sky-100 text-sky-700",
    sub: "text-slate-700",
    handle: "bg-sky-200",
  },
} as const;

export default function StaffConfirmModal({
  open,
  onConfirm,
  onCancel,
  theme = "decompiler",
  lockSeconds = 10,
  confirmLockSeconds = 5,
}: Props) {
  const [remaining, setRemaining] = useState(lockSeconds);
  const [confirmRemaining, setConfirmRemaining] = useState(confirmLockSeconds);
  const t = THEMES[theme];

  useEffect(() => {
    if (!open) return;
    setRemaining(lockSeconds);
    setConfirmRemaining(confirmLockSeconds);
    const iv = window.setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
      setConfirmRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => window.clearInterval(iv);
  }, [open, lockSeconds, confirmLockSeconds]);

  const locked = remaining > 0;
  const confirmLocked = confirmRemaining > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={spring}
            className={`relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl ${t.panel}`}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={locked}
              aria-label="닫기"
              className={`absolute right-4 top-4 w-9 h-9 rounded-full flex items-center justify-center transition ${
                locked
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
            >
              {locked ? (
                <span className="text-xs font-bold tabular-nums">{remaining}</span>
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>

            <div className={`w-12 h-1.5 rounded-full mx-auto mb-4 sm:hidden ${t.handle}`} />
            <div className="text-3xl mb-2">🧾</div>
            <h2 className="text-xl font-extrabold mb-2 pr-10">입금을 직원에게 확인받으셨나요?</h2>
            <p className={`text-sm mb-5 ${t.sub}`}>
              직원이 입금 내역을 직접 확인한 후에만 다음 단계로 진행해주세요. 확인 없이 진행하시면 주문이 처리되지
              않을 수 있습니다.
            </p>

            <div className={`rounded-2xl p-3 mb-5 text-sm font-semibold ${t.pill}`}>
              {locked
                ? `${remaining}초 후에 닫기 버튼이 활성화됩니다.`
                : "직원 확인이 끝났다면 아래 버튼을 눌러주세요."}
            </div>

            <motion.button
              whileTap={{ scale: confirmLocked ? 1 : 0.96 }}
              onClick={onConfirm}
              disabled={confirmLocked}
              className={`w-full rounded-full py-4 font-extrabold flex items-center justify-center gap-2 transition ${
                confirmLocked ? "bg-stone-300 text-stone-500 cursor-not-allowed" : t.accent
              }`}
            >
              <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
                ✓
              </span>
              {confirmLocked
                ? `${confirmRemaining}초 후 활성화`
                : "네, 직원에게 확인받았습니다"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
