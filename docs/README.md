# docs/ — what is current, and what is history

Every document here is kept on purpose: this project records *why* a decision was made, and
deleting that record costs more than the file does. But a reader needs to know which pages
describe the site as it is today and which describe a state it has passed through.

**Start with [release-2026-08-03.md](./release-2026-08-03.md) — the current release report.**

Deployment mechanics, decisions and the operational history live in the studio vault under
`01_Clients/Adamenko_Photography/`.

---

## Current — describes the site as it stands

| Document | What it is |
|---|---|
| [release-2026-08-03.md](./release-2026-08-03.md) | **The release report.** Status, architecture, gallery edit, performance, a11y, SEO, QA, deployment, and the blockers / optional / future split. |
| [gallery-recut-2026-08-01.md](./gallery-recut-2026-08-01.md) | The editorial re-cut, why frames were withdrawn, the content-hash fix, and the `mariages-1` re-review. |
| [photography-workflow.md](./photography-workflow.md) | How a shoot becomes a published story: the library, `story.txt`, and the build commands. |
| [email-architecture.md](./email-architecture.md) | Contact delivery on Resend — templates, env vars, failure behaviour. |
| [image-guidelines.md](./image-guidelines.md) | Export sizes, formats and naming for the photographer. |
| [brand-identity.md](./brand-identity.md) · [brand-foundation.md](./brand-foundation.md) | The brand the site is built to. |
| [google-reviews.md](./google-reviews.md) | The review sync pipeline and what it needs to run. |

## History — accurate when written, superseded since

Kept for provenance. Do not treat these as instructions.

| Document | Superseded by |
|---|---|
| [launch-checklist.md](./launch-checklist.md) | Launch completed 2026-06-29 → the release report |
| [owner-todo.md](./owner-todo.md) | Pre-launch owner queue → the vault's growth pack |
| [launch-blockers-v1.md](./launch-blockers-v1.md) | The v1 blocker list, all cleared |
| [product-audit-v1.md](./product-audit-v1.md) | The original-site audit that started the project |
| [original-site-recovery.md](./original-site-recovery.md) | What was recovered from the previous site |
| [image-quality-audit.md](./image-quality-audit.md) | One-off audit, acted on |
| [localization-roadmap.md](./localization-roadmap.md) | EN shipped; routing consolidated since |
| [analytics-recommendation.md](./analytics-recommendation.md) | Analytics implemented |
| [photography-recommendations.md](./photography-recommendations.md) | Folded into the workflow + guidelines |
| `content-collection/` | Content gathering, complete |
