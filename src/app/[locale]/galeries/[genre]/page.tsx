// Phase 2 stub — real genre galleries arrive in P13. FR-shaped filesystem:
// [genre] is always the FR slug; EN aliases (/en/galleries/families …) are
// P14 rewrites from the registry.

import { allGenreParams } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return allGenreParams.map((genre) => ({ genre }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; genre: string }>;
}) {
  const { locale, genre } = await params;
  return (
    <>
      <h1>galerie : {genre}</h1>
      <p>{locale}</p>
    </>
  );
}
