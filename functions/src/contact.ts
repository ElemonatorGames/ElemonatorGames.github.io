export interface Env {
  RESEND_API_KEY: string;
  TO_EMAIL: string;      // elemonatorgames@gmail.com
  FROM_EMAIL: string;    // e.g., web@egigames.com (verified domain)
  ALLOW_ORIGIN: string;  // https://elemonatorgames.github.io
}

function cors(env: Env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // Preflight
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(env) });

    if (req.method !== "POST") return new Response("Not Found", { status: 404 });

    const origin = req.headers.get("Origin") || "";
    if (!origin.startsWith(env.ALLOW_ORIGIN)) return new Response("Forbidden", { status: 403 });

    const body = await req.text();
    const params = new URLSearchParams(body);

    const name = (params.get("name") || "").trim();
    const email = (params.get("email") || "").trim();
    const message = (params.get("message") || "").trim();

    // anti-spam fields
    const honeypot = (params.get("company") || "").trim();
    const ts = Number(params.get("ts") || "0");
    const token = params.get("token");

    // basic validation & spam checks
    if (!name || !email || !message) return bad("Missing fields");
    if (honeypot) return bad("Bot");
    if (token !== "egi-v1") return bad("Token");
    if (!Number.isFinite(ts) || Date.now() - ts < 4000) return bad("Too fast");

    // send via Resend REST
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.TO_EMAIL],
        subject: `EGI Contact: ${name}`,
        reply_to: email,
        text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`
      })
    });

  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error", res.status, text);
    return new Response("Email service error", { status: 502, headers: cors(env) });
  }
    return Response.redirect(`${env.ALLOW_ORIGIN}/thanks`, 303);

    function bad(msg: string){ return new Response(msg, { status: 400, headers: cors(env) }); }
  }
};
