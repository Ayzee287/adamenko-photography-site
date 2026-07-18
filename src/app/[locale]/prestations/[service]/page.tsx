// Phase 2 stub — real service pages (the fusion objects) arrive in P13.
// FR-shaped filesystem: the [service] param is always the FR slug; EN public
// aliases (/en/services/family …) are wired as rewrites in P14 from the same
// registry.

import { allServiceParams } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return allServiceParams.map((service) => ({ service }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}) {
  const { locale, service } = await params;
  return (
    <main id="main">
      <h1>service : {service}</h1>
      <p>{locale}</p>
    </main>
  );
}
