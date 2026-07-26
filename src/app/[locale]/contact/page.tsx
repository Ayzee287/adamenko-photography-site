// Contact — the Letter. Not a form in a box: a quiet correspondence in the dark, the
// reassurance beside it. Reuses the census InquiryForm (progressive, validated, a11y)
// and ContactReassurance — recoloured to CHAMBRE by the token re-theme, no new code.

import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { Develop } from "@/components/chambre/develop";
import { InquiryForm, type InquiryFormLabels } from "@/components/forms/inquiry-form";
import { ContactReassurance } from "@/components/content/contact-reassurance";
import { submitInquiry } from "@/lib/forms/submit-inquiry";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const active = isLocale(locale) ? locale : defaultLocale;
  const c = getDictionary(active).copy.contact;
  return buildMetadata({ title: c.title, description: c.intro, path: "/contact", locale: active });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const dict = getDictionary(active);
  const c = dict.copy.contact;
  const f = c.form;
  const email = dict.photographer.contact.email;

  const labels: InquiryFormLabels = {
    name: f.name,
    email: f.email,
    sessionType: f.occasion,
    sessionTypePlaceholder: f.occasionPlaceholder,
    period: f.period,
    place: f.place,
    message: f.message,
    // The "how did you find me?" select is not rendered here (no `sources` passed),
    // so these labels are inert — kept only to satisfy the frozen form contract.
    source: f.occasion,
    sourcePlaceholder: f.occasionPlaceholder,
    optionalSuffix: f.optionalSuffix,
    honeypot: "company",
    submit: f.submit,
    sending: f.sending,
    errors: {
      name: f.errors.name,
      email: f.errors.email,
      sessionType: f.errors.occasion,
      message: f.errors.message,
    },
    formError: f.error,
    mailtoLabel: f.mailtoLabel,
    success: {
      heading: f.successHeading,
      body: f.successBody,
    },
    statusSent: f.statusSent,
    statusError: f.statusError,
  };

  // The channels a visitor can use instead of the form — only those actually configured
  // (an unset channel has an empty href and is never rendered as a dead link).
  const directHeading = active === "en" ? "Or write to me directly" : "Ou écrivez-moi directement";
  const directChannels = dict.contactChannels.channels.filter(
    (ch) => ch.id !== "form" && ch.href && ch.value,
  );

  // Submitted values are ServiceSlugs (the inquiry schema's enum); the visible labels
  // come from the localised occasion map (keyed by the canonical French occasion), so
  // the dropdown reads "Family / Maternity / …" on the English site.
  const ol = f.occasionLabels;
  const sessionTypes = [
    { value: "famille", label: ol.Famille },
    { value: "grossesse", label: ol.Grossesse },
    { value: "couple", label: ol.Couple },
    { value: "mariage", label: ol.Mariage },
  ];

  return (
    <ChambreScene>
      <ChapterOpening kicker={c.eyebrow} title={c.title} intro={c.intro} mark="§" />

      {/* Contact is a conversion page: the FORM is the hero (left, wider), the quiet
          reassurance + the direct channels support it (right). No dominant photograph —
          the visitor came to write, and the living-darkroom already carries the mood. */}
      <section className="ch-movement ch-wrap">
        <div className="ch-contact-grid">
          <Develop className="ch-contact-form">
            <InquiryForm
              action={submitInquiry}
              labels={labels}
              sessionTypes={sessionTypes}
              origin="/contact"
              locale={active}
              mailtoHref={`mailto:${email}`}
            />
          </Develop>

          <Develop delay={90} className="ch-contact-side">
            <ContactReassurance
              heading={c.reassurance.title}
              steps={[...c.reassurance.steps]}
            />

            <div className="ch-contact-direct">
              <p className="ch-mono ch-kicker">
                <span className="n">§</span> {directHeading}
              </p>
              <ul className="ch-list ch-contact-channels">
                {directChannels.map((ch) => (
                  <li key={ch.id}>
                    <span className="ch-mono ch-contact-channel-label">{ch.label}</span>
                    <a
                      className="ch-contact-channel-link"
                      href={ch.href}
                      {...(ch.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {ch.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Develop>
        </div>
      </section>
    </ChambreScene>
  );
}
