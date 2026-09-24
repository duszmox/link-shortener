// asks TypeSafe's Jev model whether a url points to a scam or porn site
// docs: https://docs.typesafe.ai/primitives/noul

const TYPESAFE_URL = "https://api.typesafe.ai/v1/systemone";
// block when jev is more than 66% sure the answer is yes
const BLOCK_THRESHOLD = 0.66;

type NoulAnswer = { type: "noul"; noul: number };

export type UrlSafety = {
  blocked: boolean;
  reason?: "scam" | "porn";
  scam: number;
  porn: number;
};

export const checkUrlSafety = async (url: string): Promise<UrlSafety> => {
  const res = await fetch(TYPESAFE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "jev-latest",
      state: { url, hostname: new URL(url).hostname },
      questions: {
        is_scam: {
          type: "noul",
          instructions: "Does `url` point to a scam site?",
          criteria: {
            true: "Phishing, fraud, fake stores, fake giveaways or prizes, crypto or investment scams, impersonation of a known brand or bank, or malware downloads",
            false: "A legitimate site, or nothing in the URL suggests fraud",
          },
        },
        is_porn: {
          type: "noul",
          instructions:
            "Does `url` point to a pornographic or sexually explicit adult site?",
          criteria: {
            true: "Pornography, sexually explicit content, adult cams, or escort services",
            false:
              "Not an adult site, or nothing in the URL suggests sexually explicit content",
          },
        },
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`TypeSafe request failed: ${res.status} ${await res.text()}`);
  }
  const { answers } = (await res.json()) as {
    answers: { is_scam: NoulAnswer; is_porn: NoulAnswer };
  };
  const scam = answers.is_scam.noul;
  const porn = answers.is_porn.noul;

  if (scam > BLOCK_THRESHOLD) return { blocked: true, reason: "scam", scam, porn };
  if (porn > BLOCK_THRESHOLD) return { blocked: true, reason: "porn", scam, porn };
  return { blocked: false, scam, porn };
};
