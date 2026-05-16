import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ITEM_BY_ID, ITEM_ORDER, SHORT_CODE_LEN, QTY_DIGITS, isValidOrderCode } from "@/lib/orderCodec";
import {
  SKCS_ITEM_ORDER,
  SKCS_PREFIX,
  SKCS_SHORT_CODE_LEN,
  SKCS_QTY_DIGITS,
  isValidSkcsOrderCode,
  isSkcsCode,
} from "@/lib/skcsCodec";

type ScanResult = {
  ts: number;
  code: string;
  ok: boolean;
  message: string;
  nickname?: string;
  itemsSummary?: string;
  booth?: "decompiler" | "skcs";
};

function decodeDecompilerItems(code: string): { id: string; name: string; qty: number }[] {
  const qtyStr = code.slice(SHORT_CODE_LEN);
  const result: { id: string; name: string; qty: number }[] = [];
  for (let i = 0; i < ITEM_ORDER.length; i++) {
    const slice = qtyStr.slice(i * QTY_DIGITS, (i + 1) * QTY_DIGITS);
    const qty = parseInt(slice, 10) || 0;
    if (qty > 0) {
      const meta = ITEM_BY_ID[ITEM_ORDER[i].id];
      result.push({ id: meta.id, name: meta.name, qty });
    }
  }
  return result;
}

function decodeSkcsItemsLocal(code: string): { id: string; name: string; qty: number }[] {
  const qtyStr = code.slice(SKCS_PREFIX.length + SKCS_SHORT_CODE_LEN);
  const result: { id: string; name: string; qty: number }[] = [];
  for (let i = 0; i < SKCS_ITEM_ORDER.length; i++) {
    const slice = qtyStr.slice(i * SKCS_QTY_DIGITS, (i + 1) * SKCS_QTY_DIGITS);
    const qty = parseInt(slice, 10) || 0;
    if (qty > 0) {
      const meta = SKCS_ITEM_ORDER[i];
      result.push({ id: meta.id, name: meta.name, qty });
    }
  }
  return result;
}

export default function QrReader() {
  const [buffer, setBuffer] = useState("");
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [autoFocus, setAutoFocus] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus, scans]);

  useEffect(() => {
    const onClick = () => autoFocus && inputRef.current?.focus();
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [autoFocus]);

  const handleSubmit = async (raw: string) => {
    const code = raw.trim();
    setBuffer("");
    if (!code) return;

    const isSkcs = isSkcsCode(code);
    const valid = isSkcs ? isValidSkcsOrderCode(code) : isValidOrderCode(code);
    if (!valid) {
      setScans((p) =>
        [{ ts: Date.now(), code, ok: false, message: "잘못된 코드 형식" }, ...p].slice(0, 50)
      );
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id, nickname, paid, items, payment_method, booth")
      .eq("payment_code", code)
      .maybeSingle();

    if (error || !data) {
      setScans((p) =>
        [{ ts: Date.now(), code, ok: false, message: "주문을 찾을 수 없음" }, ...p].slice(0, 50)
      );
      return;
    }

    const decoded = isSkcs ? decodeSkcsItemsLocal(code) : decodeDecompilerItems(code);
    const summary = decoded.map((d) => `${d.name} x${d.qty}`).join(", ");
    const booth: "decompiler" | "skcs" = isSkcs ? "skcs" : "decompiler";

    if (data.paid) {
      setScans((p) =>
        [
          {
            ts: Date.now(),
            code,
            ok: true,
            message: "이미 결제 확인됨",
            nickname: data.nickname,
            itemsSummary: summary,
            booth,
          },
          ...p,
        ].slice(0, 50)
      );
      return;
    }

    const { error: updErr } = await supabase
      .from("orders")
      .update({ paid: true })
      .eq("id", data.id);

    setScans((p) =>
      [
        {
          ts: Date.now(),
          code,
          ok: !updErr,
          message: updErr ? "업데이트 실패" : "결제 확인 완료 → 현황판에 추가됨",
          nickname: data.nickname,
          itemsSummary: summary,
          booth,
        },
        ...p,
      ].slice(0, 50)
    );
  };

  return (
    <div className="show-cursor min-h-screen bg-stone-900 text-stone-100 p-6 flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <span className="text-4xl">📷</span> QR 리더기
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          USB QR 스캐너를 연결하고, 코드를 스캔하면 자동으로 결제가 확인됩니다.
          <span className="block mt-1 text-stone-500 text-xs">
            <span className="text-orange-400 font-bold">DECOMPILER</span> = 숫자 26자리 ·{" "}
            <span className="text-amber-400 font-bold">SKCS</span> = 'S' + 숫자 14자리
          </span>
        </p>
      </header>

      <div className="bg-stone-800 rounded-2xl p-5 mb-6 border border-stone-700">
        <label className="block text-xs font-bold text-stone-400 mb-2">
          입력 버퍼 (자동 포커스 됨)
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(buffer);
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            autoComplete="off"
            placeholder="QR 스캔 대기중…"
            className="flex-1 bg-stone-900 border-2 border-stone-700 rounded-xl px-4 py-3 font-mono text-lg focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-500 text-white font-bold px-5 rounded-xl hover:bg-orange-600"
          >
            확인
          </button>
        </form>
        <label className="mt-3 inline-flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
          <input
            type="checkbox"
            checked={autoFocus}
            onChange={(e) => setAutoFocus(e.target.checked)}
          />
          자동 포커스 유지
        </label>
      </div>

      <div className="flex-1">
        <h2 className="text-sm font-bold text-stone-400 mb-2 uppercase tracking-wider">
          최근 스캔 ({scans.length})
        </h2>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {scans.map((s) => (
              <motion.div
                layout
                key={s.ts}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className={`rounded-xl p-4 border-2 ${
                  s.ok ? "bg-emerald-950/40 border-emerald-700" : "bg-red-950/40 border-red-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold flex items-center gap-2 flex-wrap">
                    <span>{s.ok ? "✅" : "❌"}</span>
                    {s.booth && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          s.booth === "skcs"
                            ? "bg-amber-500/30 text-amber-200"
                            : "bg-orange-500/30 text-orange-200"
                        }`}
                      >
                        {s.booth === "skcs" ? "SKCS" : "DECOMPILER"}
                      </span>
                    )}
                    <span>{s.message}</span>
                    {s.nickname && (
                      <span className={s.booth === "skcs" ? "text-amber-300" : "text-orange-400"}>
                        · {s.nickname}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-400">
                    {new Date(s.ts).toLocaleTimeString("ko-KR")}
                  </div>
                </div>
                {s.itemsSummary && (
                  <div className="text-sm text-stone-300 mt-1">{s.itemsSummary}</div>
                )}
                <div className="font-mono text-[11px] text-stone-500 mt-1 break-all">{s.code}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {scans.length === 0 && (
            <div className="text-center text-stone-600 py-12 border border-dashed border-stone-700 rounded-xl">
              아직 스캔 기록이 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
