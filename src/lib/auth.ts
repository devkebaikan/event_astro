import type { AstroCookies } from "astro";

// ── App.Locals type (tersedia di semua .astro via Astro.locals.auth) ──────────
declare global {
  namespace App {
    interface Locals {
      auth: {
        isAuthenticated: boolean;
        token: string | null;
      };
    }
  }
}

const COOKIE_NAME = "authToken";

// =============================================================================
// SERVER — gunakan di .astro frontmatter
// =============================================================================

const isServer = typeof window === "undefined";
const CLIENT_KEY = (
  isServer
    ? (process.env.CLIENT_KEY ??
       process.env.PUBLIC_CLIENT_KEY ??
       import.meta.env.PUBLIC_CLIENT_KEY ??
       "")
    : (import.meta.env.PUBLIC_CLIENT_KEY ?? "")
) as string;

/** Baca token dari Astro cookies (server-side). */
export function getServerToken(cookies: AstroCookies): string | null {
  return cookies.get(COOKIE_NAME)?.value ?? null;
}

/** Buat Authorization & Client Key header untuk fetch ke API. */
export function bearerHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (CLIENT_KEY) {
    headers["X-Client-Key"] = CLIENT_KEY;
  }
  return headers;
}

// =============================================================================
// CLIENT — gunakan di <script> tag
// =============================================================================

/** Baca token dari browser cookie. */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)authToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Simpan token ke cookie (default 14 hari). */
export function setToken(token: string, days = 14): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/** Hapus token dari cookie. */
export function removeToken(): void {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/; SameSite=Lax`;
}

/** Cek apakah user sudah login. */
export function isLoggedIn(): boolean {
  return Boolean(getToken());
}

/**
 * Proteksi halaman — redirect ke login jika belum login.
 * Gunakan di DOMContentLoaded:  if (!requireAuth()) return;
 */
export function requireAuth(redirectTo = "/auth/login"): boolean {
  if (!isLoggedIn()) {
    const from = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `${redirectTo}?from=${from}`;
    return false;
  }
  return true;
}

/** Logout: hapus token dan redirect ke halaman login. */
export function logout(redirectTo = "/auth/login"): void {
  removeToken();
  window.location.href = redirectTo;
}
