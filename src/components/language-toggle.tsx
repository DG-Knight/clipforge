"use client";

import { LuLanguages } from "react-icons/lu";
import { useLocale, useSetLocale } from "@/lib/i18n";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Language toggle: th / en / zh dropdown (persisted in the settings store).
 * A 2-way cycle button no longer scales to three locales — the menu lists all
 * LOCALES in order with the active one marked.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="language"
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ${className}`}
      >
        <LuLanguages className="w-3.5 h-3.5" />
        <span>{LOCALE_LABELS[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(LOCALES as readonly Locale[]).map((l) => (
          <DropdownMenuItem key={l} onClick={() => setLocale(l)}>
            {l === locale ? `✓ ${LOCALE_LABELS[l]}` : LOCALE_LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
