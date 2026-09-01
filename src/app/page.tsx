import type { Metadata } from "next";
import { Suspense } from "react";
import Storefront from "@/components/Storefront";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title:
    "Chitral Natural Nuts | Buy Organic Dry Fruits Online in Pakistan",
  description:
    "Premium sun-dried dry fruits from Chitral, delivered across Pakistan: walnuts (akhrot), almonds (badam), chalghoza pine nuts, dried apricots (khumani), white mulberries (shahtoot) & anjeer. 100% organic, cash on delivery.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Chitral Natural Nuts — Pure & Organic from the Hindu Kush",
    description:
      "Hand-picked walnuts, almonds, chalghoza, apricots, mulberries & figs from Chitral. Fresh batches, COD nationwide.",
    images: [{ url: "/images/hero-banner-1.jpg", width: 1200, height: 675 }],
    type: "website",
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Chitral Natural Nuts",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Chitral Natural Nuts",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mark.svg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bazaar Road",
    addressLocality: "Chitral",
    addressRegion: "Khyber Pakhtunkhwa",
    addressCountry: "PK",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92-340-8895642",
    contactType: "customer service",
    areaServed: "PK",
  },
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      <Suspense fallback={<div className="min-h-screen bg-[#f6f4ef]" />}>
        <Storefront />
      </Suspense>
    </>
  );
}
