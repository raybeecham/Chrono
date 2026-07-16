export type LiveAIProvider = "gemini" | "openai";

export type AIProviderPreference = LiveAIProvider | "auto";

type ProviderEnvironment = {
  preference?: string;
  geminiKey?: string;
  openAIKey?: string;
};

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function selectAIProvider({
  preference,
  geminiKey,
  openAIKey,
}: ProviderEnvironment): LiveAIProvider | null {
  const normalized = preference?.trim().toLowerCase() ?? "auto";

  if (normalized === "gemini") {
    return hasValue(geminiKey) ? "gemini" : null;
  }

  if (normalized === "openai") {
    return hasValue(openAIKey) ? "openai" : null;
  }

  if (hasValue(geminiKey)) return "gemini";
  if (hasValue(openAIKey)) return "openai";
  return null;
}
