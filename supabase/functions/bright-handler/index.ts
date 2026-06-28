import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PI_API_KEY = Deno.env.get("PI_API_KEY") ?? "";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, paymentId, txid } = await req.json();
    if (!paymentId) return json({ ok: false, error: "paymentId required" }, 400);

    if (action === "approve") {
      const r = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers: { Authorization: `Key ${PI_API_KEY}`, "Content-Type": "application/json" },
      });
      const d = await r.json();
      console.log("approve:", r.status, JSON.stringify(d));
      return json({ ok: r.ok, data: d });
    }

    if (action === "complete") {
      const r = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: { Authorization: `Key ${PI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ txid }),
      });
      const d = await r.json();
      console.log("complete:", r.status, JSON.stringify(d));
      return json({ ok: r.ok, data: d });
    }

    return json({ ok: false, error: "unknown action" }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
