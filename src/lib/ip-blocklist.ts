import { BLOCKED_IP_RANGES } from "./blocked-ip-ranges";

function ipToLong(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    const octet = Number(part);
    if (!/^\d{1,3}$/.test(part) || octet > 255) return null;
    result = result * 256 + octet;
  }
  return result;
}

const ranges = BLOCKED_IP_RANGES.map((range) => {
  const [start, end] = range.split(":");
  return [ipToLong(start)!, ipToLong(end)!] as const;
});

export function isIpBlocked(ip: string): boolean {
  // Strip the IPv4-mapped IPv6 prefix, e.g. "::ffff:1.2.3.4"
  const ipLong = ipToLong(ip.replace(/^::ffff:/, ""));
  if (ipLong === null) return false;
  return ranges.some(([start, end]) => ipLong >= start && ipLong <= end);
}

// First hop of x-forwarded-for, as set by the hosting proxy
export function getClientIp(headers: Headers): string | null {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    null
  );
}

// Where visitors from blocklisted IPs end up
export const RICKROLL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
