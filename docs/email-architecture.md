# Email Architecture — Adamenko Photography

The contact form's delivery pipeline, and the **complete** steps to switch it on after a
production domain is purchased. The engineering is finished; everything below the
"Architecture" section is operator configuration — **no code change is required**.

> **Current state: LIVE in production.** Resend domain `adamenko-photography.com` verified
> (EU/Ireland, `eu-west-1`, SPF+DKIM pass, sending enabled, open/click tracking off), env vars
> set in Vercel, deployed. A real production submission delivers both the owner notification
> and the visitor confirmation. (With no mail credentials the action returns its form-scope
> error and the form shows the graceful email/Instagram fallback — the site stays usable
> either way.)
>
> The messages were re-cut into the site's **CHAMBRE** art direction; they previously carried
> V1's cream/clay palette from the now-inert `globals.css`. See `src/lib/email/templates.ts`
> and preview them with `npm run email:preview`.

---

## Architecture

A visitor submits the form → the **`submitInquiry` Server Action** validates, screens the
honeypot and rate-limits per IP, then sends **two** emails through the **Resend REST API**
(`fetch`, no SDK, nothing at build time):

1. **Owner notification** → the photographer's inbox. `From` = branded sender,
   **Reply-To = the visitor**, so her "Reply" goes straight back to them. This send is the
   success gate.
2. **Visitor confirmation** → the visitor — a courteous auto-reply, sent **only after** the owner
   notification succeeds, and **best-effort**: if it fails the submission still succeeds (the
   inquiry is already delivered). `From` = branded sender, **Reply-To = the owner inbox**, so the
   visitor's reply reaches her.

```
inquiry-form.tsx ──Server Action──▶ submitInquiry()
                                       │  1. honeypot (company filled) → "success", send nothing
                                       │  2. inquirySchema.safeParse   → field errors, input kept
                                       │  3. rate limit (5 / 10 min / IP) → form error
                                       │  4. getEmailConfig            → form error if env missing
                                       │  5. send OWNER notification   → form error if Resend fails (gate)
                                       │  6. send VISITOR confirmation → best-effort (logged, never fails)
                                       └▶ status: "success"
```

There is **no `/api/contact` route** — that was the pre-Server-Action shape, and the HTTP
status codes it returned no longer exist. Every failure now surfaces as either per-field
errors (input preserved) or one form-scope error that shows the email/Instagram fallback.

### Modules

| File | Responsibility |
|---|---|
| [`src/lib/contact.ts`](../src/lib/contact.ts) | Shared validation + honeypot. The **same** module is imported by the client form and the server route, so the select options and the server enum can never drift. |
| [`src/lib/email/config.ts`](../src/lib/email/config.ts) | Reads + validates the three env vars **at request time** (never at build). Returns `missing` names when incomplete and non-fatal `warnings` for placeholder / `resend.dev` senders. |
| [`src/lib/email/templates.ts`](../src/lib/email/templates.ts) | `buildOwnerNotification` + `buildVisitorConfirmation(data, locale)`, both rendered through one shared `renderShell` in the site's **CHAMBRE** art direction (obsidian page, bone type, one ember accent, mono cartel over a serif title — the token values are read off `src/styles/chambre.css`). Each returns subject + **plain-text + HTML**. The visitor confirmation is **locale-aware** — native hand-written FR + EN copy (no machine translation), selected by the locale the form was submitted from (default FR); the owner notification is always French. Escapes all HTML and strips control chars from the subject. |
| [`src/lib/email/send.ts`](../src/lib/email/send.ts) | `sendEmail(config, { to, replyTo, subject, text, html })` — the one Resend `fetch`; `from` is always the branded sender. Returns a discriminated result (`provider` / `network`); never throws. |
| [`src/lib/log.ts`](../src/lib/log.ts) | Structured JSON logging (one object per line). **No PII** — only counts, enums, and provider status codes. |
| [`src/lib/forms/submit-inquiry.ts`](../src/lib/forms/submit-inquiry.ts) | The `"use server"` action. Composes the above; honeypot, validation, per-IP rate limit, then the two sends with the gate/best-effort semantics. |
| [`scripts/email-preview.mjs`](../scripts/email-preview.mjs) | Renders every distinct message (owner full / minimal / hostile, visitor FR / EN) to `.email-preview/` as HTML + plain text, with a side-by-side desktop/mobile contact sheet. Sends nothing. |

### Action states (and what the form does)

| `InquiryState` | Meaning | Form behaviour |
|---|---|---|
| `success` | **Owner notification delivered** (or honeypot silently dropped). Visitor confirmation is best-effort and does not affect this. | Success confirmation replaces the form |
| `error` + `fieldErrors` | Validation failed | Inline per-field errors; input preserved |
| `error` + `formError` | Rate-limited, email **not configured**, or Resend rejected the owner notification | Graceful error + email/Instagram fallback; input preserved |

The action never fakes success: an unconfigured or failing mail path returns `formError`, so
the visitor is told honestly and given another way to reach the studio.

Log events (`src/lib/log.ts`, scope `inquiry`): `delivered`, `rate_limited`,
`email_unconfigured`, `email_config_warning`, `owner_send_failed`,
`confirmation_send_failed`, `confirmation_threw`. The last three are `warn`/`error` lines
that never fail the submission for the visitor.

### Security / abuse properties

- **Honeypot** (`company` field, off-screen) → bots get a silent `success` and nothing is sent.
- **Server-side validation** is the source of truth (the browser's `required`/`type=email` is a first pass only).
- **HTML escaping** on every interpolated value; **control-char stripping** on the subject.
- **No secret ever reaches the client** — the API key lives only in server env; the bundle imports none of the email modules.
- **Reply-To** is intentional per message: owner notification → the **visitor**; visitor confirmation → the **owner inbox**. `From` is always the branded `CONTACT_FROM_EMAIL`, displayed as `Adamenko Photography <…>`.
- Logs carry **no visitor PII** (name/email/message are never logged).

---

## Required environment variables

Set in **Vercel → Project → Settings → Environment Variables** (Production **and** Preview).
Names + illustrative values are in [`.env.example`](../.env.example).

| Variable | Required | Purpose | If unset |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes (SEO) | Canonical/OG/sitemap/robots/JSON-LD origin, no trailing slash. Also the emails' site links — unset, they are **omitted** rather than shipped pointing at localhost. | Falls back to `localhost` |
| `RESEND_API_KEY` | Yes (email) | Resend auth (`re_…`) | Form-scope error + fallback |
| `CONTACT_TO_EMAIL` | Yes (email) | Inbox that receives inquiries (any working address) | Form-scope error + fallback |
| `CONTACT_FROM_EMAIL` | Yes (email) | The `From` address — **must** be on a Resend-verified domain. `sendEmail` wraps it as `Adamenko Photography <address>` so inboxes show the studio, not a bare address. | Form-scope error + fallback |

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
