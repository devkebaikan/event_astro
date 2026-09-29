export interface SeoProps {
  /** Page title — digabung dengan site name: "Judul | Site Name" */
  title: string;
  /** Deskripsi halaman (50–160 karakter) */
  description: string;
  /** Path ke OG image — 1200×630px, root-relative atau URL absolut */
  image?: string;
  /** Alt text untuk OG image */
  imageAlt?: string;
  /** Open Graph type — default 'website', gunakan 'article' untuk blog post */
  type?: "website" | "article";
  /** Override canonical URL (default: URL halaman saat ini) */
  canonical?: string;
  /** Robots directive — default 'index, follow' */
  robots?: string;
  /** Tanggal publish artikel (ISO 8601) — hanya untuk type='article' */
  publishedTime?: string;
  /** Tanggal terakhir diubah (ISO 8601) — hanya untuk type='article' */
  modifiedTime?: string;
  /** Nama author artikel */
  author?: string;
  /** Locale halaman — default dari SITE_CONFIG */
  locale?: string;
}

/** Konfigurasi global site — update sesuai project Anda */
export const SITE_CONFIG = {
  name: "Beramalbersama.com",
  tagline: "Tagline website Anda",
  description:
    "Deskripsi default website Anda untuk halaman yang tidak mengeset deskripsi.",
  ogImage: "/og-default.png",
  locale: "id_ID",
  twitterHandle: "@namasite",
} as const;
