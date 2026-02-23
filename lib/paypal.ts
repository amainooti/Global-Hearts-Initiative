/**
 * lib/paypal.ts
 * Thin wrapper around PayPal Orders API v2 and Subscriptions API v1.
 * No SDK — just fetch. Set these env vars:
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_ENV  → "sandbox" | "live"  (defaults to sandbox)
 */

const BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ── Auth ─────────────────────────────────────────────────────────────────────

let _cachedToken: string | null = null;
let _tokenExpiry: number        = 0;

export async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const clientId     = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const credentials  = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method:  "POST",
    headers: {
      Authorization:  `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();

  _cachedToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _cachedToken!;
}

async function pp(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const res   = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer:         "return=representation",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal ${path} → ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Orders API v2 ─────────────────────────────────────────────────────────────

export interface CreateOrderParams {
  amount:       number;    // in USD (dollars, not cents)
  currency?:    string;
  returnUrl:    string;
  cancelUrl:    string;
  description?: string;
  customId?:    string;    // we use this to store metadata as JSON string
}

export interface PayPalOrder {
  id:     string;
  status: string;
  links:  { href: string; rel: string; method: string }[];
}

export async function createOrder(params: CreateOrderParams): Promise<PayPalOrder> {
  const { amount, currency = "USD", returnUrl, cancelUrl, description, customId } = params;

  return pp("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value:         amount.toFixed(2),
          },
          description: description ?? "Donation — Zakat Foundation of America",
          custom_id:   customId ?? "",
        },
      ],
      application_context: {
        brand_name:          "Zakat Foundation of America",
        landing_page:        "NO_PREFERENCE",
        user_action:         "PAY_NOW",
        return_url:          returnUrl,
        cancel_url:          cancelUrl,
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });
}

export async function captureOrder(orderId: string): Promise<PayPalOrder> {
  return pp(`/v2/checkout/orders/${orderId}/capture`, { method: "POST", body: "{}" });
}

export async function getOrder(orderId: string): Promise<PayPalOrder> {
  return pp(`/v2/checkout/orders/${orderId}`);
}

// ── Subscriptions API v1 ───────────────────────────────────────────────────────

export interface CreateSubscriptionParams {
  planId:    string;   // pre-created PayPal plan ID stored in env
  returnUrl: string;
  cancelUrl: string;
  email?:    string;
  name?:     string;
  customId?: string;
}

export async function createSubscription(params: CreateSubscriptionParams) {
  const { planId, returnUrl, cancelUrl, email, name, customId } = params;

  return pp("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id:    planId,
      custom_id:  customId ?? "",
      subscriber: {
        ...(name  ? { name:  { given_name: name }   } : {}),
        ...(email ? { email_address: email           } : {}),
      },
      application_context: {
        brand_name:          "Zakat Foundation of America",
        shipping_preference: "NO_SHIPPING",
        user_action:         "SUBSCRIBE_NOW",
        return_url:          returnUrl,
        cancel_url:          cancelUrl,
      },
    }),
  });
}

// ── Webhook verification ───────────────────────────────────────────────────────

export async function verifyWebhook(params: {
  headers:   Record<string, string>;
  rawBody:   string;
  webhookId: string;
}): Promise<boolean> {
  const { headers, rawBody, webhookId } = params;
  try {
    const res = await pp("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo:         headers["paypal-auth-algo"],
        cert_url:          headers["paypal-cert-url"],
        transmission_id:   headers["paypal-transmission-id"],
        transmission_sig:  headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id:        webhookId,
        webhook_event:     JSON.parse(rawBody),
      }),
    });
    return res.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}