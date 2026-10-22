import { readBounded } from "./security.js";
const allowed = new Set([
  "id.barentswatch.no",
  "live.ais.barentswatch.no",
  "www.barentswatch.no",
  "api.met.no",
  "nomads.ncep.noaa.gov",
  "api.pelyr.com",
]);
export class BoundedMap extends Map {
  constructor(capacity = 128) {
    super();
    this.capacity = capacity;
  }
  set(key, value) {
    if (!this.has(key) && this.size >= this.capacity)
      this.delete(this.keys().next().value);
    return super.set(key, value);
  }
}
export async function providerFetch(input, init = {}) {
  const url = new URL(input);
  if (
    url.protocol !== "https:" ||
    !allowed.has(url.hostname) ||
    url.username ||
    url.password
  )
    throw Error("Upstream host is not allowed");
  const controller = new AbortController(),
    abort = () => controller.abort();
  if (init.signal?.aborted) abort();
  else init.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 6000);
  try {
    const response = await fetch(url, {
      ...init,
      redirect: "error",
      signal: controller.signal,
    });
    const cap =
      url.hostname === "live.ais.barentswatch.no"
        ? 16777216
        : url.hostname === "id.barentswatch.no"
          ? 65536
          : 4194304;
    if (Number(response.headers.get("content-length")) > cap)
      throw Error("Upstream response is too large");
    const bytes = await readBounded(response.body, cap);
    return new Response(bytes, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", abort);
  }
}
