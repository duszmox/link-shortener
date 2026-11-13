import Cookies from "js-cookie";
import { useSyncExternalStore } from "react";

// Bump when the cookie policy changes in a way that needs fresh consent;
// stored choices with another version are ignored and the banner shows again.
export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = "cookie_consent";
// Ask again after six months, as EU regulators (e.g. CNIL) recommend
const CONSENT_MAX_AGE_DAYS = 180;

// Optional categories. Strictly necessary cookies need no consent and aren't listed.
export type ConsentChoices = {
  // Google reCAPTCHA on the protected-link page
  recaptcha: boolean;
};

export type Consent = ConsentChoices & {
  version: number;
  // When the choice was made (ISO 8601), so it can be shown and re-asked
  decidedAt: string;
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// useSyncExternalStore needs a stable snapshot, so parse once per cookie value
let cachedRaw: string | undefined;
let cachedConsent: Consent | null = null;

function readConsent(): Consent | null {
  const raw = Cookies.get(CONSENT_COOKIE);
  if (raw === cachedRaw) return cachedConsent;
  cachedRaw = raw;
  cachedConsent = parseConsent(raw);
  return cachedConsent;
}

function parseConsent(raw: string | undefined): Consent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (
      value?.version !== CONSENT_VERSION ||
      typeof value.recaptcha !== "boolean" ||
      typeof value.decidedAt !== "string"
    ) {
      return null;
    }
    return {
      version: value.version,
      decidedAt: value.decidedAt,
      recaptcha: value.recaptcha,
    };
  } catch {
    return null;
  }
}

export function saveConsent(choices: ConsentChoices) {
  const consent: Consent = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    recaptcha: choices.recaptcha,
  };
  Cookies.set(CONSENT_COOKIE, JSON.stringify(consent), {
    expires: CONSENT_MAX_AGE_DAYS,
    path: "/",
    sameSite: "lax",
    secure: window.location.protocol === "https:",
  });
  settingsOpen = false;
  emit();
}

/**
 * The visitor's stored choice: `undefined` while it can't be read yet (server
 * render and hydration), `null` if they haven't decided, otherwise their choice.
 */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribe, readConsent, () => undefined);
}

// Whether the visitor reopened the preferences to change or withdraw consent
let settingsOpen = false;

export function openCookieSettings() {
  settingsOpen = true;
  emit();
}

export function closeCookieSettings() {
  settingsOpen = false;
  emit();
}

export function useCookieSettingsOpen() {
  return useSyncExternalStore(
    subscribe,
    () => settingsOpen,
    () => false
  );
}
