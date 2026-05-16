// Tiny shared "sold out" state stored in localStorage and broadcast across
// tabs/components via a custom event. Single-device kiosk friendly.
// Namespaced so each booth (decompiler / skcs) keeps its own list.
import { useEffect, useState } from "react";

function makeSoldOut(namespace: string) {
  const KEY = `${namespace}.soldOut.v1`;
  const EVT = `${namespace}:sold-out-change`;

  const read = (): Set<string> => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr.map(String) : []);
    } catch {
      return new Set();
    }
  };

  const write = (set: Set<string>) => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...set]));
      window.dispatchEvent(new CustomEvent(EVT));
    } catch {
      /* ignore */
    }
  };

  const setItem = (id: string, soldOut: boolean) => {
    const s = read();
    if (soldOut) s.add(id);
    else s.delete(id);
    write(s);
  };

  const useHook = () => {
    const [ids, setIds] = useState<Set<string>>(() => read());
    useEffect(() => {
      const refresh = () => setIds(read());
      window.addEventListener(EVT, refresh);
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) refresh();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(EVT, refresh);
        window.removeEventListener("storage", onStorage);
      };
    }, []);
    return ids;
  };

  return { useHook, setItem };
}

const decompiler = makeSoldOut("decompiler");
const skcs = makeSoldOut("skcs");

export const useSoldOut = decompiler.useHook;
export const setSoldOut = decompiler.setItem;

export const useSkcsSoldOut = skcs.useHook;
export const setSkcsSoldOut = skcs.setItem;
