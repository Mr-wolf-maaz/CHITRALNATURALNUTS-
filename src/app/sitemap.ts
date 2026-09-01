import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({ id: products.id, createdAt: products.createdAt })
      .from(products);
    productUrls = rows.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error("sitemap: failed to load products", e);
  }

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...productUrls,
  ];
}
