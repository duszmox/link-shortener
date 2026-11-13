"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  closeCookieSettings,
  openCookieSettings,
  saveConsent,
  useConsent,
  useCookieSettingsOpen,
  type Consent,
} from "@/lib/cookie-consent";

// Accept and reject share one style so neither choice is nudged (EDPB 03/2022)
const choiceButton =
  "flex-1 rounded-md border-2 border-gray-600 px-4 py-2 font-RobotoMono text-sm hover:bg-gray-100 dark:hover:bg-gray-800";

export function CookieBanner() {
  const consent = useConsent();
  const settingsOpen = useCookieSettingsOpen();

  // Unknown until the cookie is read on the client; render nothing to avoid a flash
  if (consent === undefined) return null;
  if (consent !== null && !settingsOpen) return null;

  return (
    <ConsentDialog
      // Remount on reopen so the toggles start from the stored choice
      key={consent?.decidedAt ?? "new"}
      consent={consent}
      reopened={settingsOpen}
    />
  );
}

function ConsentDialog({
  consent,
  reopened,
}: {
  consent: Consent | null;
  reopened: boolean;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Optional categories start off: no pre-ticked boxes
  const [recaptcha, setRecaptcha] = useState(consent?.recaptcha ?? false);
  const [customizing, setCustomizing] = useState(reopened);

  useEffect(() => {
    if (reopened) dialogRef.current?.focus();
  }, [reopened]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      onKeyDown={(e) => {
        // Escape only dismisses when there is already a stored choice to keep
        if (e.key === "Escape" && consent) closeCookieSettings();
      }}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto rounded-lg border-2 border-gray-600 bg-white p-6 text-black shadow-none outline-hidden dark:bg-black dark:text-white"
    >
      <h2
        id={titleId}
        className="mb-2 font-RobotoMono font-semibold uppercase"
      >
        Cookies
      </h2>
      <p id={descriptionId} className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        We use cookies that are needed to sign you in and to open links. With
        your consent we also load Google reCAPTCHA on protected links, which
        lets Google set cookies and receive your IP address and browser data.
        You can change your choice at any time via &ldquo;Cookie settings&rdquo;
        at the bottom of the page. See our{" "}
        <Link href="/legal/cookies" className="underline">
          cookie policy
        </Link>
        .
      </p>

      {customizing && (
        <fieldset className="mb-4 space-y-3">
          <legend className="sr-only">Cookie categories</legend>
          <Category
            id="consent-necessary"
            title="Strictly necessary"
            description="Sign-in session, protected-link redirect and remembering this choice. Always on, as the site can't work without them."
            checked
            disabled
          />
          <Category
            id="consent-recaptcha"
            title="Google reCAPTCHA"
            description="Bot check on links their creator restricted. Google LLC (USA) processes your data under its own privacy policy."
            checked={recaptcha}
            onChange={setRecaptcha}
          />
        </fieldset>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className={choiceButton}
          onClick={() => saveConsent({ recaptcha: false })}
        >
          Reject all
        </button>
        <button
          type="button"
          className={choiceButton}
          onClick={() => saveConsent({ recaptcha: true })}
        >
          Accept all
        </button>
        {customizing ? (
          <button
            type="button"
            className={choiceButton}
            onClick={() => saveConsent({ recaptcha })}
          >
            Save choices
          </button>
        ) : (
          <button
            type="button"
            className={choiceButton}
            onClick={() => setCustomizing(true)}
          >
            Customize
          </button>
        )}
      </div>
    </div>
  );
}

function Category({
  id,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border-2 border-gray-300 p-3 dark:border-gray-700">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        aria-describedby={`${id}-description`}
        className="mt-1 h-4 w-4 shrink-0"
      />
      <div>
        <label htmlFor={id} className="block text-sm font-semibold">
          {title}
          {disabled && (
            <span className="ml-2 text-xs font-normal text-gray-500">
              (always on)
            </span>
          )}
        </label>
        <p id={`${id}-description`} className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  return (
    <button type="button" className="underline" onClick={openCookieSettings}>
      Cookie settings
    </button>
  );
}
