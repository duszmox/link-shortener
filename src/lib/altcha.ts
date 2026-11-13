// Server-side ALTCHA proof-of-work for restricted links. Self-hosted: no third
// party, no cookies. The browser solves the challenge, the server checks it.
import {
  createChallenge,
  randomInt,
  verifySolution,
  type Challenge,
  type Payload,
} from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { deriveHmacKeySecret } from "altcha-lib/frameworks/nextjs";

// Long enough for a slow phone to solve it, short enough that a solved
// challenge can't be stockpiled
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

let secrets: Promise<{
  hmacSignatureSecret: string;
  hmacKeySignatureSecret: string;
}> | null = null;

function getSecrets() {
  const secret = process.env.ALTCHA_HMAC_SECRET;
  if (!secret) throw new Error("ALTCHA_HMAC_SECRET is not set");
  secrets ??= deriveHmacKeySecret(secret).then((keySecret) => ({
    hmacSignatureSecret: secret,
    hmacKeySignatureSecret: keySecret,
  }));
  return secrets;
}

export async function createLinkChallenge(slug: string): Promise<Challenge> {
  return createChallenge({
    algorithm: "PBKDF2/SHA-256",
    cost: 5_000,
    // Deterministic mode: the server knows the answer, so verifying is one HMAC
    counter: randomInt(10_000, 5_000),
    deriveKey,
    // Signed with the challenge, so a solution only unlocks the link it was issued for
    data: { slug },
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    ...(await getSecrets()),
  });
}

// `payload` is the base64 JSON the widget emits on "verified"
export async function verifyLinkSolution(
  payload: string,
  slug: string
): Promise<boolean> {
  let parsed: Partial<Payload> | null;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch {
    return false;
  }
  if (!parsed?.challenge?.parameters || !parsed.solution) return false;
  if (parsed.challenge.parameters.data?.slug !== slug) return false;

  try {
    const result = await verifySolution({
      challenge: parsed.challenge,
      solution: parsed.solution,
      deriveKey,
      ...(await getSecrets()),
    });
    return result.verified;
  } catch {
    // Malformed parameters (e.g. an unknown algorithm) make the library throw
    return false;
  }
}
