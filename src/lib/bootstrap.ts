import { readFile } from "fs/promises";
import path from "path";
import { pool } from "@/db";

/**
 * Self-healing bootstrap: if the Postgres volume is ever reset by a redeploy,
 * recreate the schema and reseed the catalogue on server start.
 * Everything here is idempotent.
 */

const DDL = `
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  weight_options text[] NOT NULL DEFAULT ARRAY['250g','500g','1kg']::text[],
  original_price numeric(12,2) NOT NULL,
  sale_price numeric(12,2),
  stock integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  whatsapp text NOT NULL DEFAULT '',
  address text NOT NULL,
  city text NOT NULL,
  payment_method text NOT NULL DEFAULT 'Cash on Delivery',
  total_amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  price_per_unit numeric(12,2) NOT NULL,
  selected_weight text NOT NULL DEFAULT '1kg'
);
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

async function attempt<T>(fn: () => Promise<T>, retries = 4, delayMs = 1500): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

export async function ensureSchema(): Promise<void> {
  try {
    await attempt(async () => {
      await pool.query(DDL);
      // Seed files are idempotent (guarded by NOT EXISTS checks).
      const seedProducts = await readFile(path.join(process.cwd(), "scripts/seed.sql"), "utf8");
      await pool.query(seedProducts);
      const seedReviews = await readFile(path.join(process.cwd(), "scripts/seed-reviews.sql"), "utf8");
      await pool.query(seedReviews);
    });
    console.log("[bootstrap] schema ensured");
  } catch (e) {
    // Never block server startup — routes surface their own errors.
    console.error("[bootstrap] schema ensure failed:", e);
  }
}
