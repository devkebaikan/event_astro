import type { AxiosResponse } from "axios";
import { publicApi, serverApi } from "./api";

// Non-generic dengan AxiosResponse eksplisit — hindari T={} inference issue
async function safe(
  fn: () => Promise<AxiosResponse<any>>,
  label: string,
): Promise<any> {
  try {
    const { data } = await fn();
    return data;
  } catch (error) {
    console.error(`[API] ${label}:`, error);
    return null;
  }
}

export async function getPaymentMethod(link: string) {
  return safe(
    () =>
      publicApi.get("/payment/payment-method", {
        params: { program_link: link },
      }),
    "getPaymentMethod",
  );
}

export async function getInvoice(inv: string | null) {
  return safe(
    () => publicApi.get(`/transactions/invoice/${inv}`),
    "getInvoice",
  );
}
// Throws if token is invalid — used as a guard
export async function getIsTokenValid(token: string): Promise<boolean> {
  await serverApi(token).post("/validate-token");
  return true;
}

export async function getUserProfile(token: string) {
  return safe(
    () => serverApi(token).get("/dashboard/donatur/my-account"),
    "getUserProfile",
  );
}
// ── Event ─────────────────────────────────────────────────────────────────────

export interface EventListParams {
  page?: number;
  limit?: number;
  search?: string;
  mode?: "pagination" | "list";
}

export async function getEvents(params: EventListParams = {}) {
  return safe(() => publicApi.get("/events", { params }), "getEvents");
}

export async function getEventBySlug(slug: string, token?: string | null) {
  return safe(
    () =>
      token
        ? serverApi(token).get(`/events/slug/${slug}`)
        : publicApi.get(`/events/slug/${slug}`),
    "getEventBySlug",
  );
}

export async function getEventByLink(link: string, token?: string | null) {
  return safe(
    () =>
      token
        ? serverApi(token).get(`/events/slug/${link}`)
        : publicApi.get(`/events/slug/${link}`),
    "getEventByLink",
  );
}
