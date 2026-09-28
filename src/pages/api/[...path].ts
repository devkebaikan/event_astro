import type { APIRoute } from "astro";

export const prerender = false;

const allowedPaths = [
  /^auth\/.+$/,
  /^otp$/,
  /^logout$/,
  /^dashboard\/.+$/,
  /^events?(\/.*)?$/,
  /^payment\/.+$/,
  /^transactions(\/.*)?$/,
  /^discount\/.+$/,
  /^validate-token$/,
];

export const ALL: APIRoute = async ({ params, request, cookies }) => {
  const path = params.path ?? "";

  if (!allowedPaths.some((pattern) => pattern.test(path))) {
    return new Response(JSON.stringify({ message: "Endpoint tidak diizinkan" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl =
    process.env.INTERNAL_API_URL ??
    import.meta.env.INTERNAL_API_URL ??
    process.env.PUBLIC_API_URL ??
    import.meta.env.PUBLIC_API_URL;

  const clientKey =
    process.env.CLIENT_KEY ??
    import.meta.env.CLIENT_KEY ??
    process.env.PUBLIC_CLIENT_KEY ??
    import.meta.env.PUBLIC_CLIENT_KEY;

  if (!baseUrl || !clientKey) {
    return new Response(
      JSON.stringify({ message: "Konfigurasi server belum lengkap" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const token = cookies.get("authToken")?.value;
  const headers = new Headers({
    Accept: "application/json",
    "X-Client-Key": clientKey,
  });

  const contentType = request.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  } else if (request.method !== "GET" && request.method !== "HEAD") {
    headers.set("Content-Type", "application/json");
  }

  const authorization = request.headers.get("Authorization");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else if (authorization) {
    headers.set("Authorization", authorization);
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${baseUrl.replace(/\/+$/, "")}/${path}`);
  upstreamUrl.search = incomingUrl.search;

  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const body = hasBody ? await request.text() : undefined;

    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body,
    });

    const responseData = await response.text();

    return new Response(responseData, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        message: err?.message ?? "Gagal terhubung ke server backend",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};