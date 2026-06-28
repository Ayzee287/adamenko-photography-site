"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  activeLocales,
  canonicalPathname,
  localeFromPathname,
  localeShort,
  localizedPath,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Manual language switcher (real-content launch pass). Built and wired into the
 * header (desktop + mobile), but it renders **nothing while a single locale is
 * active** — so it produces zero visual change today and the approved header is
 * untouched. The instant a second locale is added to `activeLocales`, the switcher
 * appears, preserving the current path across locales (canonical FR path is
 * re-prefixed per locale via the routing helpers).
 */
export function LanguageSwitcher({
  onDark = false,
  className,
  label = "Language",
}: {
  onDark?: boolean;
  className?: string;
  label?: string;
}) {
  const pathname = usePathname() || "/";

  // Nothing to switch between yet → no UI (no regression to the approved chrome).
  if (activeLocales.length < 2) return null;

  const current = localeFromPathname(pathname);
  // Strip ANY locale prefix (incl. the default) so the per-locale links are identical
  // and correct between SSR (/fr/…) and the hydrated client (/…) (I1).
  const basePath = canonicalPathname(pathname);

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      {activeLocales.map((locale, i) => {
        const active = locale === current;
        return (
          <span key={locale} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden className="opacity-30">
                ·
              </span>
            ) : null}
            <Link
              href={localizedPath(locale, basePath)}
              hrefLang={locale}
              aria-current={active ? "true" : undefined}
              className={cn(
                "hover:text-clay",
                active
                  ? onDark
                    ? "text-paper underline decoration-paper/70 underline-offset-4"
                    : "text-ink underline decoration-clay underline-offset-4"
                  : onDark
                    ? "text-paper/60"
                    : "text-muted",
              )}
            >
              {localeShort[locale]}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
