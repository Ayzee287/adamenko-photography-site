// Contact — the Letter. Not a form in a box: a quiet correspondence in the dark, the
// reassurance beside it. Reuses the census InquiryForm (progressive, validated, a11y)
// and ContactReassurance — recoloured to CHAMBRE by the token re-theme, no new code.

import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { Develop } from "@/components/chambre/develop";
import { Plate } from "@/components/chambre/plate";
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
    period: "Période envisagée",
    place: "Lieu",
    message: f.message,
    source: "Comment m'avez-vous trouvée ?",
    sourcePlaceholder: "Choisissez…",
    optionalSuffix: "(facultatif)",
    honeypot: "Ne pas remplir",
    submit: f.submit,
    sending: f.sending,
    errors: {
      name: f.errors.name,
      email: f.errors.email,
      sessionType: f.errors.occasion,
      message: f.errors.message,
    },
    formError: f.error,
    mailtoLabel: "M'écrire directement par e-mail",
    success: {
      heading: "Merci, votre message est bien parti.",
      body: "Je vous réponds sous quelques jours.",
    },
    statusSent: "Message envoyé.",
    statusError: "L'envoi a échoué. Votre message est conservé.",
  };

  // The channels a visitor can use instead of the form — only those actually configured
  // (an unset channel has an empty href and is never rendered as a dead link).
  const directHeading = active === "en" ? "Or write to me directly" : "Ou écrivez-moi directement";
  const directChannels = dict.contactChannels.channels.filter(
    (ch) => ch.id !== "form" && ch.href && ch.value,
  );

  // Submitted values are ServiceSlugs (the inquiry schema's enum); labels are French.
  const sessionTypes = [
    { value: "famille", label: "Famille" },
    { value: "grossesse", label: "Grossesse" },
    { value: "couple", label: "Couple" },
    { value: "mariage", label: "Mariage" },
    { value: "portrait", label: "Portrait" },
  ];

  return (
    <ChambreScene>
      <ChapterOpening kicker={c.eyebrow} title={c.title} intro={c.intro} mark="§ Contact" />

      <section className="ch-movement ch-wrap">
        <div className="ch-split">
          <Develop>
            <div style={{ maxWidth: "40rem" }}>
              <InquiryForm
                action={submitInquiry}
                labels={labels}
                sessionTypes={sessionTypes}
                origin="/contact"
                locale={active}
                mailtoHref={`mailto:${email}`}
              />
            </div>
          </Develop>
          <Develop delay={90}>
            <ContactReassurance
              heading={c.reassurance.title}
              steps={[...c.reassurance.steps]}
              promise={dict.contactChannels.responseTime}
            />

            {/* The column used to end here, leaving a dead half-screen beside the form.
                A warm frame and the direct channels close it: the visitor who would rather
                write than fill in a form has somewhere to go, and the moment stays human. */}
            <div className="ch-contact-aside">
              <Plate
                src="/galleries/familles/familles-a07.jpg"
                alt="Une maman et son tout-petit dans une rue de Lyon, front contre front."
                ratio="tall"
                sizes="(min-width: 52rem) 40vw, 100vw"
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
            </div>
          </Develop>
        </div>
      </section>
    </ChambreScene>
  );
}
