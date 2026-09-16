export type ProductDTO = {
  id: string;
  title: string;
  description: string;
  category: string;
  weightOptions: string[];
  originalPrice: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  createdAt: string;
};

export type CategoryDTO = {
  id: string;
  name: string;
  urdu: string;
  image: string;
  description?: string;
  createdAt: string;
};

export type OrderItemDTO = {
  id: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  selectedWeight: string;
  title?: string;
  imageUrl?: string;
};

export type OrderDTO = {
  id: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: OrderItemDTO[];
};

export const CATEGORIES = [
  { name: "Walnuts", urdu: "اخروٹ", image: "https://images.unsplash.com/photo-1585518419759-78b70fe6e619?w=400&h=400&fit=crop" },
  { name: "Almonds", urdu: "بادام", image: "https://images.unsplash.com/photo-1585518419759-78b70fe6e619?w=400&h=400&fit=crop" },
  { name: "Chalghoza", urdu: "چلغوزہ", image: "https://images.unsplash.com/photo-1599599810694-b5ac4dd84e13?w=400&h=400&fit=crop" },
  { name: "Dried Apricots", urdu: "خمانی", image: "https://images.unsplash.com/photo-1585518419759-78b70fe6e619?w=400&h=400&fit=crop" },
  { name: "White Mulberries", urdu: "شہتوت", image: "https://images.unsplash.com/photo-1599599810694-b5ac4dd84e13?w=400&h=400&fit=crop" },
  { name: "Dried Figs", urdu: "انجیر", image: "https://images.unsplash.com/photo-1585518419759-78b70fe6e619?w=400&h=400&fit=crop" },
  { name: "Honey", urdu: "شہد", image: "https://images.unsplash.com/photo-1599599810694-b5ac4dd84e13?w=400&h=400&fit=crop" },
  { name: "Salajet", urdu: "سلاجیت", image: "https://images.unsplash.com/photo-1585518419759-78b70fe6e619?w=400&h=400&fit=crop" },
];

export const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export const WEIGHT_FACTORS: Record<string, number> = {
  "250g": 0.28,
  "500g": 0.52,
  "1kg": 1,
};

/** Prices are stored per-kg; weight variants derive from it. */
export function priceForWeight(perKg: number, weight: string): number {
  const f = WEIGHT_FACTORS[weight] ?? 1;
  return Math.round((perKg * f) / 10) * 10;
}

export function effectiveKgPrice(p: { originalPrice: number; salePrice: number | null }): number {
  return p.salePrice ?? p.originalPrice;
}

export function discountPercent(p: { originalPrice: number; salePrice: number | null }): number {
  if (!p.salePrice || p.salePrice >= p.originalPrice) return 0;
  return Math.round((1 - p.salePrice / p.originalPrice) * 100);
}

export function formatRs(n: number): string {
  return "Rs " + Math.round(n).toLocaleString("en-US");
}

export const SHIPPING_FEE = 250;
export const FREE_SHIPPING_THRESHOLD = 5000;

export function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/** Deterministic pseudo "sold %" for flash-sale urgency bars. */
export function soldPercent(id: string, stock: number): number {
  if (stock <= 0) return 100;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return 35 + (h % 55);
}

export function serializeProduct(row: {
  id: string;
  title: string;
  description: string;
  category: string;
  weightOptions: string[];
  originalPrice: string;
  salePrice: string | null;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  createdAt: Date;
}): ProductDTO {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    weightOptions: row.weightOptions ?? ["250g", "500g", "1kg"],
    originalPrice: Number(row.originalPrice),
    salePrice: row.salePrice === null ? null : Number(row.salePrice),
    stock: row.stock,
    imageUrl: row.imageUrl,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt.toISOString(),
  };
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Parse a fetch Response as JSON, producing a human-friendly error when the
 * server (or hosting proxy) answers with an HTML error page instead of JSON.
 * Never let "Unexpected token '<' ..." leak into the UI.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readApiJson<T = any>(res: Response): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tryParse = (text: string): any | null => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };
  const text = await res.text();
  if (!res.ok) {
    const parsed = tryParse(text);
    if (parsed?.error) throw new Error(String(parsed.error));
    if (res.status >= 500) {
      throw new Error("The server is restarting — please wait a few seconds and try again.");
    }
    if (res.status === 404) {
      throw new Error("This page is outdated — please reload and try again.");
    }
    throw new Error(`Request failed (${res.status}). Please try again.`);
  }
  const parsed = tryParse(text);
  if (parsed === null) {
    throw new Error("Unexpected response from the server — please reload the page.");
  }
  return parsed as T;
}
