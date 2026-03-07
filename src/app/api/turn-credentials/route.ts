// /app/api/turn-credentials/route.ts
// Xirsys credentials are kept server-side only — never exposed to the browser.

export async function GET() {
  // Use env vars if available, otherwise use hardcoded fallbacks
  const ident = process.env.XIRSYS_IDENT || "hasanali";
  const secret =
    process.env.XIRSYS_SECRET || "8ab703b6-1a2a-11f1-a386-0242ac140002";
  const channel = process.env.XIRSYS_CHANNEL || "my-book";

  try {
    const token = Buffer.from(`${ident}:${secret}`).toString("base64");

    const res = await fetch(`https://global.xirsys.net/_turn/${channel}`, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ format: "urls" }),
      // Next.js: don't cache TURN credentials (they're short-lived tokens)
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[TURN] Xirsys responded:", res.status);
      return Response.json([]);
    }

    const data = await res.json();
    const iceServers = data?.v?.iceServers ?? [];
    return Response.json(iceServers);
  } catch (err) {
    console.error("[TURN] Fetch error:", err);
    return Response.json([]);
  }
}
