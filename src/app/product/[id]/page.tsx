import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { effectiveKgPrice, priceForWeight, serializeProduct } from "@/lib/utils";
import ProductView from "@/components/ProductView";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getProduct(id: string) {
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return p ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await getProduct(id);
    if (!p) return { title: "Product not found" };
    const price = priceForWeight(
      effectiveKgPrice({ originalPrice: Number(p.originalPrice), salePrice: p.salePrice === null ? null : Number(p.salePrice) }),
      "250g"
    );
    const title = `${p.title} — Rs ${price.toLocaleString("en-US")}`;
    const description =
      p.description.slice(0, 155) ||
      `Buy ${p.title} online in Pakistan. 100% organic Chitrali dry fruits with cash on delivery.`;
    return {
      title,
      description,
      alternates: { canonical: `/product/${p.id}` },
      openGraph: {
        title: `${p.title} | Chitral Natural Nuts`,
        description,
        images: [{ url: p.imageUrl, width: 800, height: 800, alt: p.title }],
        type: "website",
      },
    };
  } catch {
    return { title: "Chitral Natural Nuts" };
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();

  const [reviewRows, agg, related] = await Promise.all([
    db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, p.id))
      .orderBy(desc(reviews.createdAt))
      .limit(50),
    db
      .select({
        avg: sql<string>`coalesce(avg(${reviews.rating}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, p.id)),
    db
      .select()
      .from(products)
      .where(and(eq(products.category, p.category), ne(products.id, p.id)))
      .limit(5),
  ]);

  const product = serializeProduct(p);
  const ratingAvg = Number(agg[0]?.avg ?? 0);
  const ratingCount = agg[0]?.count ?? 0;
  const kgPrice = priceForWeight(effectiveKgPrice(product), "1kg");

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: [product.imageUrl.startsWith("http") ? product.imageUrl : `${SITE_URL}${product.imageUrl}`],
    category: product.category,
    brand: { "@type": "Brand", name: "Chitral Natural Nuts" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "PKR",
      price: kgPrice,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (ratingCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingAvg.toFixed(1),
      reviewCount: ratingCount,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductView
        product={product}
        reviews={reviewRows.map((r) => ({
          id: r.id,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
        }))}
        ratingAvg={ratingAvg}
        ratingCount={ratingCount}
        related={related.map(serializeProduct)}
      />
    </>
  );
}
