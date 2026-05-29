import crypto from "node:crypto";

function normalizeSecret(value?: string) {
  return String(value ?? "").trim();
}

function looksWeakSecret(value: string) {
  return value.length < 24 || /change-this-secret|billing-state-secret/iu.test(value);
}

export function resolveServerSecret(primarySecret: string | undefined, fallbackSecrets: Array<string | undefined> = []) {
  const candidates = [primarySecret, ...fallbackSecrets].map(normalizeSecret).filter(Boolean);
  const preferred = candidates.find((candidate) => !looksWeakSecret(candidate));

  if (preferred) {
    return {
      value: preferred,
      usedFallback: preferred !== normalizeSecret(primarySecret)
    };
  }

  if (candidates.length > 0) {
    const derived = crypto.createHash("sha256").update(candidates.join("|")).digest("base64url");
    return {
      value: derived,
      usedFallback: true
    };
  }

  return {
    value: crypto.randomBytes(32).toString("base64url"),
    usedFallback: true
  };
}
