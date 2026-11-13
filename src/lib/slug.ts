// Slug and url rules shared by the browser and the server

export const URL_PATTERN =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export const SLUG_PATTERN = /^[A-Za-z0-9-]{1,32}$/;

// Paths the app itself serves, so they can't be short links
const RESERVED_SLUGS = new Set([
  "api",
  "captcha",
  "dashboard",
  "sign-in",
  "sign-up",
]);

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug.toLowerCase()) || slug.startsWith("_");
}

// Returns why a custom slug can't be used, or null if it's fine
export function getSlugError(slug: string): string | null {
  if (!SLUG_PATTERN.test(slug)) {
    return "Slugs can only contain letters, numbers and dashes (max 32 characters)";
  }
  if (isReservedSlug(slug)) {
    return `"${slug}" is reserved, pick another slug`;
  }
  return null;
}

export function normalizeUrl(input: string) {
  const url = input.trim();
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// "/abc" -> "abc"; null for nested paths, files and the app's own pages
export function slugFromPath(pathname: string): string | null {
  const match = /^\/([^/.]+)$/.exec(pathname);
  if (!match || isReservedSlug(match[1])) return null;
  return match[1];
}
