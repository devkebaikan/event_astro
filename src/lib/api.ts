import axios from "axios";
import type { AxiosInstance } from "axios";

// Server-side: PUBLIC_API_URL (runtime from Node env)
// Client-side: PUBLIC_API_URL (baked-in at build, available via Astro's PUBLIC_ convention)
const BASE_URL = (
  import.meta.env.PUBLIC_API_URL ?? import.meta.env.PUBLIC_API_URL
) as string;

function addErrorInterceptor(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const message =
        err.response?.data?.message ?? err.message ?? "Terjadi kesalahan";
      return Promise.reject(new Error(message));
    },
  );
  return instance;
}

// ── Public API — no auth, server + client ────────────────────────────────────
export const publicApi = addErrorInterceptor(
  axios.create({
    baseURL: BASE_URL,
    timeout: 10_000,
    headers: { Accept: "application/json" },
  }),
);

// ── Server-side authenticated API (per-request instance) ─────────────────────
export function serverApi(token: string): AxiosInstance {
  return addErrorInterceptor(
    axios.create({
      baseURL: BASE_URL,
      timeout: 10_000,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  );
}

// ── Client-side API — singleton, auto-inject token, handle 401 ───────────────
let _instance: AxiosInstance | null = null;

export function useApi(): AxiosInstance {
  if (_instance) return _instance;

  _instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10_000,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  // Inject token from cookie on every request
  _instance.interceptors.request.use((config) => {
    const match = document.cookie.match(/(?:^|;\s*)authToken=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  });

  _instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        const from = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        window.location.href = `/auth/login?from=${from}`;
        return Promise.reject(err);
      }
      const message =
        err.response?.data?.message ?? err.message ?? "Terjadi kesalahan";
      return Promise.reject(new Error(message));
    },
  );

  return _instance;
}
