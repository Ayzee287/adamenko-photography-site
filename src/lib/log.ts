// Structured, dependency-free server logging. Emits one JSON object per line so
// Vercel's log viewer / any drain can filter by `scope`, `event`, and `level`
// without parsing free text. Deliberately tiny and PII-free by contract: callers
// pass only non-sensitive metadata (counts, enums, provider status codes) — never a
// visitor's name, e-mail, or message body.

type Level = "info" | "warn" | "error";
type Fields = Record<string, unknown>;

function emit(level: Level, scope: string, event: string, fields?: Fields): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    scope,
    event,
    ...fields,
  });
  // Route by level so platform log viewers aggregate/colour correctly.
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export type Logger = {
  info: (event: string, fields?: Fields) => void;
  warn: (event: string, fields?: Fields) => void;
  error: (event: string, fields?: Fields) => void;
};

/** A logger bound to a `scope` (e.g. "contact") that prefixes every line. */
export function createLogger(scope: string): Logger {
  return {
    info: (event, fields) => emit("info", scope, event, fields),
    warn: (event, fields) => emit("warn", scope, event, fields),
    error: (event, fields) => emit("error", scope, event, fields),
  };
}
