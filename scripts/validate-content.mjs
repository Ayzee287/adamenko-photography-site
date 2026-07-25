// Content-contract validation — Phase 1 STUB.
//
// The full contract (Zod schemas over every collection in src/content, with
// both-locales-or-neither, ∅-rules, consent tiers on stories) arrives in
// Phase 15 of the implementation roadmap. Until then this stub keeps the CI
// pipeline shape stable: the `validate:content` step exists from day one, and
// Phase 15 only swaps the implementation, not the pipeline.

console.log(
  "[validate:content] stub — full Zod content contract lands in Phase 15. OK.",
);
process.exit(0);
