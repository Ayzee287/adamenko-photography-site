// Phase 2 stub — story pages arrive with the content model (P13/P15).
// No stories exist yet: generateStaticParams returns [], and with
// dynamicParams=false that builds ZERO story pages — the ∅ law at the
// routing layer (the seances index is gated separately by showSeances).

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return []; // P15: map over the stories collection.
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return (
    <main id="main">
      <h1>séance : {slug}</h1>
      <p>{locale}</p>
    </main>
  );
}
