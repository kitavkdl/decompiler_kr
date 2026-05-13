// Shared menu registry & QR payment-code codec.
// Code format: 4-digit short id + 2 digits per item qty (in ITEM_ORDER sequence).
// Total length: 4 + ITEM_ORDER.length * 2.

export type Category = "hotdog" | "drink" | "popcorn" | "addon";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  group: "single" | "combo" | "addon";
  // Categories this item contributes to on the dashboard.
  categories: Category[];
  // For combo items: short label per category for the kitchen board.
  displayByCategory?: Partial<Record<Category, string>>;
};

// IMPORTANT: Order is the encoding order. Do not reorder or remove items
// without bumping a version, or old QR codes will decode incorrectly.
export const ITEM_ORDER: MenuItem[] = [
  { id: "hotdog",        name: "Hot Dog",                       price: 5000,  group: "single", categories: ["hotdog"] },
  { id: "popcorn",       name: "Popcorn",                       price: 1000,  group: "single", categories: ["popcorn"] },
  { id: "grape",         name: "Green Grape Ade",               price: 3000,  group: "single", categories: ["drink"] },
  { id: "lemon",         name: "Lemon Ade",                     price: 3000,  group: "single", categories: ["drink"] },
  { id: "icetea",        name: "Iced Tea",                      price: 2000,  group: "single", categories: ["drink"] },
  { id: "setA",          name: "Set A: Iced Tea + Hotdog",      price: 6000,  group: "combo",  categories: ["hotdog", "drink"], displayByCategory: { hotdog: "Hot Dog", drink: "Iced Tea" } },
  { id: "setB",          name: "Set B: Ade + Hotdog",           price: 7000,  group: "combo",  categories: ["hotdog", "drink"], displayByCategory: { hotdog: "Hot Dog", drink: "Ade (Grape/Lemon)" } },
  { id: "setC",          name: "Set C: Icetea + Hotdog + Keycap", price: 10000, group: "combo", categories: ["hotdog", "drink"], displayByCategory: { hotdog: "Hot Dog", drink: "Iced Tea" } },
  { id: "cheese_buldak", name: "Cheese + Buldak Sauce",         price: 500,   group: "addon",  categories: ["addon"] },
  { id: "cheese",        name: "Cheese Only",                   price: 500,   group: "addon",  categories: ["addon"] },
  { id: "buldak",        name: "Buldak Sauce Only",             price: 500,   group: "addon",  categories: ["addon"] },
];

export const SHORT_CODE_LEN = 4;
export const QTY_DIGITS = 2;
export const MAX_QTY = 99;
export const TOTAL_CODE_LEN = SHORT_CODE_LEN + ITEM_ORDER.length * QTY_DIGITS;

export const ITEM_BY_ID: Record<string, MenuItem> = Object.fromEntries(
  ITEM_ORDER.map((it) => [it.id, it])
);

export function generateShortCode(): string {
  // 4-digit zero-padded random
  return Math.floor(Math.random() * 10000).toString().padStart(SHORT_CODE_LEN, "0");
}

export function encodeOrderCode(qty: Record<string, number>, shortCode?: string): string {
  const code = shortCode ?? generateShortCode();
  const qtyStr = ITEM_ORDER
    .map((it) => Math.min(MAX_QTY, Math.max(0, qty[it.id] || 0)).toString().padStart(QTY_DIGITS, "0"))
    .join("");
  return code + qtyStr;
}

export function isValidOrderCode(code: string): boolean {
  return /^\d+$/.test(code) && code.length === TOTAL_CODE_LEN;
}
