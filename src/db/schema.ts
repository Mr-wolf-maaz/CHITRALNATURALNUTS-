import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  weightOptions: text("weight_options").array().notNull().default(sql`ARRAY['250g','500g','1kg']::text[]`),
  originalPrice: numeric("original_price", { precision: 12, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 12, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url").notNull().default(""),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isAiGenerated: boolean("is_ai_generated").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  urdu: text("urdu").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(), customerName: text("customer_name").notNull(), phone: text("phone").notNull(), whatsapp: text("whatsapp").notNull().default(""), address: text("address").notNull(), city: text("city").notNull(), paymentMethod: text("payment_method").notNull().default("Cash on Delivery"), totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(), status: text("status").notNull().default("Pending"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const orderItems = pgTable("order_items", { id: uuid("id").primaryKey().defaultRandom(), orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }), productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }), quantity: integer("quantity").notNull().default(1), pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }).notNull(), selectedWeight: text("selected_weight").notNull().default("1kg") });
export const reviews = pgTable("reviews", { id: uuid("id").primaryKey().defaultRandom(), productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }), name: text("name").notNull(), rating: integer("rating").notNull().default(5), comment: text("comment").notNull().default(""), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() });

export type ProductRow = typeof products.$inferSelect;
export type ProductImageRow = typeof productImages.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;
