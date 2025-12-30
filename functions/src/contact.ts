export interface Env {
  RESEND_API_KEY: string;
  TO_EMAIL: string;      // elemonatorgames@gmail.com
  FROM_EMAIL: string;    // e.g., web@egigames.com (verified domain)
  DOMAIN: string;  // elemonatorgames.com
  ALLOW_ORIGIN?: string; // optional; comma-separated additional allowed origins (e.g., http://localhost:4321)
}

function buildCorsHeaders(allowedOrigin: string) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function getAllowedOrigin(originHeader: string, env: Env): string | null {
  if (!originHeader) return null;
  try {
    const u = new URL(originHeader);
    const host = u.hostname.toLowerCase();

    // Accept apex and www (https)
    if (host === env.DOMAIN || host === `www.${env.DOMAIN}`) {
      return `${u.protocol}//${u.host}`;
    }

    // Allow localhost or 127.x dev origins
    if (host === 'localhost' || host.startsWith('127.')) {
      return `${u.protocol}//${u.host}`;
    }

    // Allow explicit ALLOW_ORIGIN entries (comma separated)
    if (env.ALLOW_ORIGIN) {
      const allowed = env.ALLOW_ORIGIN.split(/\s*,\s*/);
      for (const a of allowed) {
        if (originHeader.startsWith(a)) return a;
      }
    }
  } catch (e) {
    // ignore parse errors
  }
  return null;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const originHeader = req.headers.get("Origin") || "";

    // Preflight
    if (req.method === "OPTIONS") {
      const allowed = getAllowedOrigin(originHeader, env);
      if (!allowed) return new Response("Forbidden", { status: 403 });
      return new Response(null, { headers: buildCorsHeaders(allowed) });
    }

    if (req.method !== "POST") return new Response("Not Found", { status: 404 });

    const allowed = getAllowedOrigin(originHeader, env);
    if (!allowed) return new Response("Forbidden", { status: 403 });
    const allowedOrigin = allowed; // narrow type for inner closures

    const body = await req.text();
    const params = new URLSearchParams(body);

    const name = (params.get("name") || "").trim();
    const email = (params.get("email") || "").trim();
    const message = (params.get("message") || "").trim();

    // anti-spam fields
    const honeypot = (params.get("company") || "").trim();
    const ts = Number(params.get("ts") || "0");
    const token = params.get("token");

    // Determine whether request is AJAX (fetch) for JSON responses
    const accept = req.headers.get('Accept') || '';
    const xRequested = req.headers.get('X-Requested-With') || '';
    const isAjax = accept.includes('application/json') || xRequested === 'XMLHttpRequest';

    // helper for error responses with CORS headers — return JSON on AJAX requests
    function bad(msg: string, status = 400) {
      const headers = buildCorsHeaders(allowedOrigin);
      if (isAjax) {
        (headers as Record<string, string>)["Content-Type"] = "application/json";
        return new Response(JSON.stringify({ success: false, error: msg }), { status, headers });
      }
      return new Response(msg, { status, headers: buildCorsHeaders(allowedOrigin) });
    }

    // basic validation & spam checks
    if (!name || !email || !message) return bad("Missing fields");
    if (honeypot) return bad("Bot");
    if (token !== "egi-v1") return bad("Token");
    if (!Number.isFinite(ts) || Date.now() - ts < 4000) return bad("Too fast");

    // Ensure the Resend API key is configured
    if (!env.RESEND_API_KEY) return bad("Server misconfiguration: RESEND_API_KEY missing", 500);

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
      return bad("Email service error", 502);
    }

    // If request looks like AJAX/fetch, return a JSON success response (CORS headers included)
    if (isAjax) {
      const headers = { ...buildCorsHeaders(allowedOrigin), 'Content-Type': 'application/json' } as Record<string, string>;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // Non-AJAX (normal form POST) — redirect the browser to /thanks on the validated origin
    return Response.redirect(`${allowedOrigin}/thanks`, 303);
  }
};
