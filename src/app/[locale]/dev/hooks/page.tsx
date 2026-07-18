// Dev-only hooks demo — tooling, not product; 404 in production builds.

import { notFound } from "next/navigation";
import { HooksDemo } from "./demo";

export default function HooksDemoPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main id="main">
      <h1 className="text-h2 p-8">Hooks — Phase 5</h1>
      <HooksDemo />
    </main>
  );
}
