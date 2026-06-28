# Email Architecture — Adamenko Photography

The contact form's delivery pipeline, and the **complete** steps to switch it on after a
production domain is purchased. The engineering is finished; everything below the
"Architecture" section is operator configuration — **no code change is required**.

> **Current state:** code-complete and production-ready. With no mail credentials set,
> `/api/contact` returns **503** and the form shows its graceful email/Instagram fallback —
> the site stays fully usable. Setting three environment variables activates delivery.

---

## Architecture

A visitor submits the form → the client posts JSON to `/api/contact` → the route validates,
screens the honeypot, builds the email, and delivers it through the **Resend REST API**
(`fetch`, no SDK, nothing at build time). The photographer receives the inquiry and can
**reply directly** (Reply-To is the visitor's address).

```
contact-form.tsx ──POST /api/contact──▶ route.ts
                                          │  1. parse JSON            → 400 malformed
                                          │  2. honeypot (isBot)      → 200, send nothing
                                          │  3. validateContact       → 422 + field names
                                          │  4. getEmailConfig        → 503 if env missing
                                          │  5. sendContactEmail      → 502 if Resend fails
                                          └▶ 200 { ok: true }  ──▶ Resend ──▶ inbox
```

### Modules

| File | Responsibility |
|---|---|
| [`src/lib/contact.ts`](../src/lib/contact.ts) | Shared validation + honeypot. The **same** module is imported by the client form and the server route, so the select options and the server enum can never drift. |
| [`src/lib/email/config.ts`](../src/lib/email/config.ts) | Reads + validates the three env vars **at request time** (never at build). Returns `missing` names when incomplete and non-fatal `warnings` for placeholder / `resend.dev` senders. |
| [`src/lib/email/templates.ts`](../src/lib/email/templates.ts) | Builds the subject, **plain-text + HTML** body, and Reply-To. Escapes all HTML and strips control chars from header-bound values (header-injection defence). |
| [`src/lib/email/send.ts`](../src/lib/email/send.ts) | The one Resend `fetch`. Returns a discriminated result (`provider` / `network` failure); never throws. |
| [`src/lib/log.ts`](../src/lib/log.ts) | Structured JSON logging (one object per line). **No PII** — only counts, enums, and provider status codes. |
| [`src/app/api/contact/route.ts`](../src/app/api/contact/route.ts) | Composes the above into the HTTP pipeline. `runtime = "nodejs"`. |

### Status codes (and what the form does)

| Code | Meaning | Form behaviour |
|---|---|---|
| `200` | Delivered (or honeypot silently dropped) | Success confirmation replaces the form |
| `400` | Malformed JSON body | Generic transient error + fallback link |
| `422` | Validation failed | Inline per-field errors; focus the first invalid field |
| `503` | Email **not configured** (env missing) | Graceful error + email/Instagram fallback |
| `502` | Resend rejected or was unreachable | Generic transient error + fallback link |

### Security / abuse properties

- **Honeypot** (`company` field, off-screen) → bots get `200` and nothing is sent.
- **Server-side validation** is the source of truth (the browser's `required`/`type=email` is a first pass only).
- **HTML escaping** on every interpolated value; **control-char stripping** on the subject.
- **No secret ever reaches the client** — the API key lives only in server env; the bundle imports none of the email modules.
- **Reply-To** = the visitor, so the photographer replies from her own inbox.
- Logs carry **no visitor PII** (name/email/message are never logged).

---

## Required environment variables

Set in **Vercel → Project → Settings → Environment Variables** (Production **and** Preview).
Names + illustrative values are in [`.env.example`](../.env.example).

| Variable | Required | Purpose | If unset |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes (SEO) | Canonical/OG/sitemap/robots/JSON-LD origin, no trailing slash | Falls back to `localhost` |
| `RESEND_API_KEY` | Yes (email) | Resend auth (`re_…`) | `/api/contact` → 503 |
| `CONTACT_TO_EMAIL` | Yes (email) | Inbox that receives inquiries (any working address) | 503 |
| `CONTACT_FROM_EMAIL` | Yes (email) | The `From` — **must** be on a Resend-verified domain | 503 |

---

## Required DNS records (Resend domain verification)

Resend generates the exact values when you add the domain; the **types** are fixed. Add them
at your DNS host, then click *Verify* in Resend (propagation is usually minutes).

| Type | Host (example) | Purpose |
|---|---|---|
| `MX` | `send.<domain>` | Resend bounce/feedback handling |
| `TXT` (SPF) | `send.<domain>` → `v=spf1 include:amazonses.com ~all` | Authorises Resend to send |
| `TXT` (DKIM) | `resend._domainkey.<domain>` → (key from Resend) | Cryptographically signs mail |
| `TXT` (DMARC) | `_dmarc.<domain>` → `v=DMARC1; p=none;` | Alignment policy (start at `p=none`, tighten later) |

> DKIM + SPF are mandatory for deliverability. DMARC is strongly recommended; `p=none` is a
> safe, non-blocking starting policy.

---

## Go-live: connect Resend after buying the domain (≈5 minutes)

1. **Resend account** — sign up at [resend.com](https://resend.com).
2. **Verify the domain** — Resend → *Domains* → *Add Domain* → add the DNS records above → *Verify*.
3. **Configure SPF/DKIM/DMARC** — the records in step 2 (DMARC is the one you add manually).
4. **API key** — Resend → *API Keys* → create → copy the `re_…` value.
5. **Vercel env vars** — add `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
   (and confirm `NEXT_PUBLIC_SITE_URL`) for **Production + Preview**.
6. **Redeploy** — trigger a deploy so the new env is picked up (env changes don't hot-reload).
7. **Test send** — submit the live form once; confirm the email arrives and that **replying**
   goes to the visitor's address. Check the spam folder on the first send.

✅ After these steps the contact form is live. **No code change is needed at any point.**

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Form shows the fallback error; logs show `event:"unconfigured"` | One+ of the three env vars is missing | Set all three in Vercel (Prod + Preview), redeploy |
| Logs show `event:"config_warning"` | `From`/`To` is a placeholder, malformed, or a `resend.dev` address | Use a real address on the **verified** domain |
| Logs show `delivery_failed reason:"provider" status:401` | API key invalid/missing | Regenerate the key, update env, redeploy |
| `delivery_failed status:403` (domain not verified) | `From` domain isn't verified in Resend | Finish domain verification; ensure `From` is **on** that domain |
| `delivery_failed reason:"network"` | Resend unreachable (transient) | Usually self-resolves; visitor sees the fallback and can retry |
| Email lands in spam | DKIM/SPF/DMARC incomplete or new-domain reputation | Verify all records; warm up; keep DMARC at `p=none` initially |
| Env changed but behaviour unchanged | Env is read per deploy | Redeploy after any env change |

**Read the logs:** Vercel → Project → *Logs*, filter by `scope:"contact"`. Each line is JSON
with `event`, and for failures `reason` / `status` / `detail`.

---

## Owner checklist

- [ ] Buy the production domain.
- [ ] Create a Resend account.
- [ ] Add + verify the domain in Resend (MX, SPF, DKIM); add DMARC `p=none`.
- [ ] Generate a Resend API key.
- [ ] Choose the inbox that should receive inquiries (`CONTACT_TO_EMAIL`).
- [ ] Add the env vars in Vercel (Production + Preview) and redeploy.
- [ ] Send one test inquiry; confirm it arrives and Reply-To works; check spam once.

> Custom-domain origin (`NEXT_PUBLIC_SITE_URL`) and the broader launch sequence live in
> [`launch-checklist.md`](./launch-checklist.md).
