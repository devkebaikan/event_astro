/* =======================
 * FORMAT UANG (RUPIAH)
 * ======================= */
export function formatRupiah(
  value?: number | string | null,
  options?: {
    withSymbol?: boolean;
    minimumFractionDigits?: number;
  },
) {
  const number = Number(value) || 0;

  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
  }).format(number);

  return options?.withSymbol === false ? formatted : `Rp ${formatted}`;
}

/* =======================
 * FORMAT ANGKA RINGKAS
 * ======================= */
export function formatCompactNumber(
  value?: number | string | null,
  options?: {
    withSymbol?: boolean;
    minimumFractionDigits?: number;
  },
) {
  const number = Number(value) || 0;
  const fractionDigits = options?.minimumFractionDigits ?? 0;

  let formatted = "";

  if (number >= 1_000_000_000) {
    formatted = `${(number / 1_000_000_000).toFixed(fractionDigits)}B`;
  } else if (number >= 1_000_000) {
    formatted = `${(number / 1_000_000).toFixed(fractionDigits)}M`;
  } else if (number >= 1_000) {
    formatted = `${(number / 1_000).toFixed(fractionDigits)}K`;
  } else {
    formatted = number.toString();
  }

  // Hapus .0
  formatted = formatted.replace(/\.0+(?=[KMB])/i, "");

  return options?.withSymbol === false ? formatted : `Rp ${formatted}`;
}

/* =======================
 * FORMAT TANGGAL (dd MMM yyyy)
 * ======================= */
export function formatDate(
  date?: string | Date | null,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

/* =======================
 * FORMAT TANGGAL + JAM
 * ======================= */
export function formatDateTime(
  date?: string | Date | null,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(d);
}

/* =======================
 * WAKTU RELATIF
 * ======================= */

export function timeAgoFormat(date?: string | Date | null) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const now = new Date().getTime();
  const past = d.getTime();
  const diff = now - past;

  if (diff < 0) return formatDate(date);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) {
    return `${seconds} detik yang lalu`;
  }

  if (minutes < 60) {
    return `${minutes} menit yang lalu`;
  }

  if (hours < 24) {
    return `${hours} jam yang lalu`;
  }

  if (days < 7) {
    return `${days} hari yang lalu`;
  }

  if (weeks <= 4) {
    return `${weeks} minggu yang lalu`;
  }

  // > 4 minggu → tanggal normal
  return formatDate(date);
}

/* =======================
 * INITIAL NAMA
 * ======================= */
export function getInitialName(name?: string | null) {
  if (!name) return "";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function capitalizeFirstLetter(str?: string | null) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/* =======================
 * FORMAT NUMBER
 * ======================= */
export function formatNumber(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "";
  const numStr = value.toString().replace(/\D/g, "");
  if (!numStr) return "";
  return parseInt(numStr, 10).toLocaleString("id-ID");
}

/* =======================
 * FORMAT NUMBER SINGKAT (1.2 rb, 3.4 jt, dst)
 * ======================= */

export function fmt(n?: number | null): string {
  const val = n ?? 0;
  if (val >= 1_000_000_000)
    return `${(val / 1_000_000_000).toFixed(1).replace(".0", "")} M`;
  if (val >= 1_000_000)
    return `${(val / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)} rb`;
  return val.toLocaleString("id-ID");
}

/* =======================
 * SISA HARI
 * ======================= */
export function getRemainingDays(targetDateStr?: string | null): number | "∞" {
  // kalau explicit ∞
  if (targetDateStr === "∞") return "∞";

  // kalau tidak ada nilai
  if (!targetDateStr) return "∞";

  const targetDate = new Date(targetDateStr);

  // kalau invalid date
  if (isNaN(targetDate.getTime())) return "∞";

  const today = new Date();

  // reset jam
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
