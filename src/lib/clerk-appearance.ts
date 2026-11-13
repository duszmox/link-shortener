import type { ClerkProvider } from "@clerk/nextjs";
import type { ComponentProps } from "react";

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

const mono = "var(--font-roboto-mono), monospace";

// Colors point at the --auth-* tokens in globals.css, so Clerk follows the
// app's light/dark switch without any client-side theme detection.
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "var(--auth-primary)",
    colorPrimaryForeground: "var(--auth-primary-foreground)",
    colorBackground: "var(--auth-background)",
    colorForeground: "var(--auth-foreground)",
    colorMutedForeground: "var(--auth-muted-foreground)",
    colorNeutral: "var(--auth-neutral)",
    colorBorder: "var(--auth-border)",
    colorInput: "var(--auth-input)",
    colorInputForeground: "var(--auth-foreground)",
    colorDanger: "var(--auth-danger)",
    colorModalBackdrop: "#000000",
    fontFamily: "inherit",
    fontFamilyButtons: mono,
    fontFamilyMono: mono,
    borderRadius: "0.375rem",
  },
  options: {
    socialButtonsVariant: "blockButton",
    logoPlacement: "none",
  },
  elements: {
    // Same look as the shortener card: flat, 2px gray border, no shadow.
    cardBox: {
      border: "2px solid var(--auth-border)",
      borderRadius: "0.5rem",
      boxShadow: "none",
    },
    card: { boxShadow: "none", backgroundColor: "var(--auth-background)" },
    footer: { background: "var(--auth-background)" },
    headerTitle: {
      fontFamily: mono,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.02em",
    },
    formFieldLabel: {
      color: "var(--auth-muted-foreground)",
      textTransform: "uppercase",
      fontSize: "0.75rem",
    },
    formFieldInput: {
      fontFamily: mono,
      border: "none",
      boxShadow: "none",
      padding: "0.75rem",
    },
    formButtonPrimary: {
      fontFamily: mono,
      textTransform: "none",
      boxShadow: "none",
      padding: "0.75rem",
      "&:hover": { backgroundColor: "var(--auth-primary-hover)" },
    },
    socialButtonsBlockButton: { fontFamily: mono, boxShadow: "none" },
    footerActionLink: {
      color: "var(--auth-foreground)",
      textDecoration: "underline",
      fontWeight: 600,
    },
    userButtonPopoverCard: {
      border: "2px solid var(--auth-border)",
      boxShadow: "none",
    },
  },
};
