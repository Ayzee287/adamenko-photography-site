// Phase 2 stub — real assembly arrives per the roadmap (P12–P13).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main id="main">
      <h1>tarifs</h1>
      <p>{locale}</p>
    </main>
  );
}
