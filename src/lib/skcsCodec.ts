// SKCS booth menu registry & QR codec.
// Code format: 'S' prefix + 4-digit short id + 2 digits per item qty (in SKCS_ITEM_ORDER sequence).
// Total length: 1 + 4 + SKCS_ITEM_ORDER.length * 2.
// 'S' prefix prevents collision with decompiler codes (which are all-digit).

export type SkcsCategory = "keycap" | "clicker67" | "nfc";

export type SkcsMenuItem = {
  id: string;
  name: string;
  price: number;
  category: SkcsCategory;
  // Number of keycaps the customer picks for this item (0 if not applicable).
  keyCount: number;
  // Whether this item supports the base/switch/ring/keycap customization.
  customizable: boolean;
};

// IMPORTANT: Order is the encoding order. Do not reorder or remove items
// without bumping the prefix or version, or old QR codes will decode incorrectly.
export const SKCS_ITEM_ORDER: SkcsMenuItem[] = [
  { id: "key1",      name: "Keycap Clicker — 1-Key",                price: 3000, category: "keycap",   keyCount: 1, customizable: true },
  { id: "key2",      name: "Keycap Clicker — 2-Key",                price: 4000, category: "keycap",   keyCount: 2, customizable: true },
  { id: "key3",      name: "Keycap Clicker — 3-Key (Limited)",      price: 5000, category: "keycap",   keyCount: 3, customizable: true },
  { id: "clicker67", name: "67 Clicker (Limited Edition)",          price: 5000, category: "clicker67", keyCount: 0, customizable: false },
  { id: "nfc_oreo",  name: "NFC Oreo Keyring",                      price: 5000, category: "nfc",      keyCount: 0, customizable: false },
];

export const SKCS_PREFIX = "S";
export const SKCS_SHORT_CODE_LEN = 4;
export const SKCS_QTY_DIGITS = 2;
export const SKCS_MAX_QTY = 99;
export const SKCS_TOTAL_CODE_LEN =
  SKCS_PREFIX.length + SKCS_SHORT_CODE_LEN + SKCS_ITEM_ORDER.length * SKCS_QTY_DIGITS;

export const SKCS_ITEM_BY_ID: Record<string, SkcsMenuItem> = Object.fromEntries(
  SKCS_ITEM_ORDER.map((it) => [it.id, it])
);

// Customization option lists (free customization — no extra cost).
export const SKCS_BASE_OPTIONS = ["White", "Black"] as const;
export const SKCS_SWITCH_OPTIONS = [
  { id: "blue", name: "Blue (Clicky)" },
  { id: "red", name: "Red (Quiet)" },
] as const;
export const SKCS_KEYCAP_OPTIONS = ["Black", "White", "Red", "Blue", "Pink"] as const;
export const SKCS_RING_OPTIONS = ["Silver", "Black", "Gold", "Rose Gold", "Copper"] as const;

export type SkcsBase = (typeof SKCS_BASE_OPTIONS)[number];
export type SkcsSwitch = (typeof SKCS_SWITCH_OPTIONS)[number]["id"];
export type SkcsKeycap = (typeof SKCS_KEYCAP_OPTIONS)[number];
export type SkcsRing = (typeof SKCS_RING_OPTIONS)[number];

export function generateSkcsShortCode(): string {
  return Math.floor(Math.random() * 10000).toString().padStart(SKCS_SHORT_CODE_LEN, "0");
}

export function encodeSkcsOrderCode(qty: Record<string, number>, shortCode?: string): string {
  const code = shortCode ?? generateSkcsShortCode();
  const qtyStr = SKCS_ITEM_ORDER
    .map((it) => Math.min(SKCS_MAX_QTY, Math.max(0, qty[it.id] || 0)).toString().padStart(SKCS_QTY_DIGITS, "0"))
    .join("");
  return SKCS_PREFIX + code + qtyStr;
}

export function isValidSkcsOrderCode(code: string): boolean {
  if (code.length !== SKCS_TOTAL_CODE_LEN) return false;
  if (!code.startsWith(SKCS_PREFIX)) return false;
  return /^\d+$/.test(code.slice(SKCS_PREFIX.length));
}

export function isSkcsCode(code: string): boolean {
  return code.startsWith(SKCS_PREFIX);
}

export function decodeSkcsItems(code: string): { id: string; name: string; qty: number }[] {
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
