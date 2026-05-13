// Tiny shared "sold out" state stored in localStorage and broadcast across
// tabs/components via a custom event. Single-device kiosk friendly.
import { useEffect, useState } from "react";

const KEY = "decompiler.soldOut.v1";
const EVT = "decompiler:sold-out-change";

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {
    /* ignore */
  }
}

export function setSoldOut(id: string, soldOut: boolean) {
  const s = read();
  if (soldOut) s.add(id);
  else s.delete(id);
  write(s);
}

export function useSoldOut() {
  const [ids, setIds] = useState<Set<string>>(() => read());
  useEffect(() => {
    const refresh = () => setIds(read());
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) refresh();
    });
    return () => {
      window.removeEventListener(EVT, refresh);
    };
  }, []);
  return ids;
}
