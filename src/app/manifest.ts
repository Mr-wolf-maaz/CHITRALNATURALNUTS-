import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chitral Natural Nuts",
    short_name: "Natural Nuts",
    description:
      "Premium organic Chitrali nuts and dry fruits delivered across Pakistan.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#1b4332",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
