import { getToken, isLoggedIn, bearerHeaders } from "@/lib/auth";

const USER_REFF_KEY = "user_reff_code";
const INCOMING_REFF_KEY = "incoming_reff_code";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const API_URL = (import.meta.env.PUBLIC_API_URL ?? "") as string;

interface StoredIncomingReff {
  code: string;
  expiresAt: number;
}

// ── User's Own Referral Code (Untuk Share) ─────────────────────────────────

/**
 * Mengambil reff_code milik user yang sedang login.
 * Mengutamakan dari localStorage. Jika belum ada di local, fetch dari my-account dan simpan.
 * Mengembalikan null jika user belum login atau tidak memiliki reff_code.
 */
export async function getUserReffCode(): Promise<string | null> {
  if (typeof window === "undefined" || !isLoggedIn()) return null;

  try {
    const cached = localStorage.getItem(USER_REFF_KEY);
    if (cached && cached.trim() !== "") {
      return cached.trim();
    }

    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${API_URL}/dashboard/donatur/my-account`, {
      headers: bearerHeaders(token),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const reffCode = json?.data?.reff_code;

    if (reffCode && typeof reffCode === "string" && reffCode.trim() !== "") {
      const code = reffCode.trim();
      localStorage.setItem(USER_REFF_KEY, code);
      return code;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Menyimpan / memperbarui user reff_code ke localStorage.
 */
export function setUserReffCode(code: string): void {
  if (typeof window === "undefined") return;
  if (code && code.trim() !== "") {
    localStorage.setItem(USER_REFF_KEY, code.trim());
  } else {
    localStorage.removeItem(USER_REFF_KEY);
  }
}

/**
 * Menghapus user reff_code dari localStorage (dipanggil saat logout).
 */
export function clearUserReffCode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_REFF_KEY);
  // Bersihkan juga legacy key jika ada
  localStorage.removeItem("save_reff_code");
}

/**
 * Menambahkan reff_code user yang sedang login (jika ada) ke URL tujuan share.
 */
export async function appendReffCodeToUrl(targetUrl?: string | URL): Promise<string> {
  if (typeof window === "undefined") return targetUrl ? targetUrl.toString() : "";

  const base = targetUrl ? targetUrl.toString() : window.location.href;
  const urlObj = new URL(base, window.location.origin);

  const userReff = await getUserReffCode();
  if (userReff) {
    urlObj.searchParams.set("reff_code", userReff);
  }

  return urlObj.toString();
}

// ── Incoming Referral Code (Tamu / Pengunjung dari link referral orang lain) ─

/**
 * Menyimpan incoming reff_code dengan masa berlaku 1 hari (24 jam).
 */
export function saveIncomingReffCode(code: string): void {
  if (typeof window === "undefined" || !code || code.trim() === "") return;

  const item: StoredIncomingReff = {
    code: code.trim(),
    expiresAt: Date.now() + ONE_DAY_MS,
  };

  try {
    localStorage.setItem(INCOMING_REFF_KEY, JSON.stringify(item));
  } catch {
    // ignore storage error
  }
}

/**
 * Mengambil incoming reff_code jika masih dalam masa berlaku (< 1 hari).
 * Jika sudah expired, otomatis dibersihkan dan mengembalikan null.
 */
export function getIncomingReffCode(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(INCOMING_REFF_KEY);
    if (!raw) return null;

    const parsed: StoredIncomingReff = JSON.parse(raw);
    if (!parsed || !parsed.code || !parsed.expiresAt) {
      clearIncomingReffCode();
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      clearIncomingReffCode();
      return null;
    }

    return parsed.code;
  } catch {
    clearIncomingReffCode();
    return null;
  }
}

/**
 * Menghapus incoming reff_code dari localStorage.
 */
export function clearIncomingReffCode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(INCOMING_REFF_KEY);
}

/**
 * Menginisialisasi pelacakan referral code dari parameter URL (?reff_code=... atau ?ref=...).
 * Jalankan ini di layout atau halaman utama.
 */
export function initIncomingReffTracker(): void {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);
    const incomingCode = params.get("reff_code") || params.get("ref");

    if (incomingCode && incomingCode.trim() !== "") {
      saveIncomingReffCode(incomingCode.trim());
    }
  } catch {
    // ignore URL parsing error
  }
}
