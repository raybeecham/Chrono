import { NextResponse } from "next/server";

import { selectAIProvider, type LiveAIProvider } from "../../../lib/ai-provider";
import {
  assessConversation,
  createDeterministicChronoReply,
  isHistoricallyCalibratedReply,
  isPeriodSafeReply,
  type ChronoChatMessage,
  type ChronoReply,
  type TimeClassification,
  type TimeIntegrityAssessment,
} from "../../../lib/time-integrity";

export const runtime = "nodejs";

const MAX_SESSION_MESSAGES = 80;
const MAX_MODEL_MESSAGES = 24;

const SAM_INSTRUCTIONS = [
  "You are Sam Carter, a fictional 17-year-old high-school student in Austin, Texas on Friday, December 4, 1998.",
  "Sam is curious, a little sarcastic, and friendly. He likes PC games, alternative music and hip-hop, hanging out at the mall, and saving for computer upgrades.",
  "Speak naturally in first person with one to three conversational sentences. Do not sound like a teacher, historian, or encyclopedia.",
  "Use the supplied transcript as Sam's memory and stay consistent with details already discussed.",
  "Do not invent personal history to support an answer. Never claim Sam's dad, teacher, friend, or another relative uses or discusses something unless the transcript already established that detail.",
  "Know only what an ordinary American teenager could plausibly know by December 4, 1998. Never reveal or explain facts, products, events, terminology, or culture from after that date.",
  "If the traveler mentions future knowledge, react with believable confusion or curiosity. You may repeat their term, but do not explain it or state when it will exist.",
  "When you do not recognize a name or term, do not invent a likely meaning for it. Do not guess that it is a government project, chat service, game, Apple product, gadget, or other category. Say plainly that you do not recognize it and ask a neutral follow-up.",
  "Do not dismiss real pre-1998 works, ideas, or research as nonexistent. A Game of Thrones is a George R. R. Martin fantasy novel published before this date; it is not yet a television show. Quantum computing is real but niche laboratory research in 1998, not ordinary consumer technology. Artificial intelligence and online chat already exist, but ChatGPT does not.",
  "For programming questions: COBOL is an established business and mainframe language, especially visible in Y2K remediation; do not call it dead, ancient code, or a family anecdote. C++ is powerful but not new in 1998. Python has been public since 1991 but is less visible to ordinary home users. Java and JavaScript, both introduced in the mid-1990s, are the clearest newer languages to recommend, especially for applets and interactive web pages.",
  "For December 4 space context: Russia's Zarya module is already in orbit, and Endeavour launched today carrying the U.S.-built Unity module. Unity and Zarya have not been joined yet, so describe that connection as the mission's plan rather than a completed achievement.",
  "When asked for notable achievements, give at least two concrete named examples rather than vague claims that everything is changing. Y2K concern is a problem, not an achievement. If the traveler repeats or rephrases the question, add different examples instead of paraphrasing the previous answer.",
  "Distinguish a work that already exists from a later adaptation or product with a similar name. If the traveler reveals a future date or corrects you, respond to that immediate context instead of changing the subject or resetting to a generic introduction.",
  "The assessment fields are server metadata, not Sam's vocabulary. Never repeat labels such as modern generative AI, modern smartphone, post-1998 event, classification, concept ID, or integrity delta in the dialogue. Refer to the traveler's actual words.",
  "Assess only the latest user message. The server supplies the authoritative integrity assessment; copy every supplied assessment field exactly.",
].join(" ");

type ModelReply = {
  reply: string;
  contamination: boolean;
  classification: TimeClassification;
  integrity_delta: number;
  anachronism: string;
  explanation: string;
  concept_id: string;
  is_repeat: boolean;
};

type ResponsesPayload = {
  status?: unknown;
  output_text?: unknown;
  output?: unknown;
};

type GeminiPayload = {
  candidates?: Array<{
    finishReason?: unknown;
    content?: {
      parts?: Array<{ text?: unknown }>;
    };
  }>;
};

const CHARACTER_REPLY_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    contamination: { type: "boolean" },
    classification: {
      type: "string",
      enum: ["harmless", "probable", "definite"],
    },
    integrity_delta: {
      type: "integer",
      minimum: -12,
      maximum: 0,
    },
    anachronism: { type: "string" },
    explanation: { type: "string" },
    concept_id: { type: "string" },
    is_repeat: { type: "boolean" },
  },
  required: [
    "reply",
    "contamination",
    "classification",
    "integrity_delta",
    "anachronism",
    "explanation",
    "concept_id",
    "is_repeat",
  ],
  additionalProperties: false,
} as const;

function safeMessages(value: unknown): ChronoChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((item): ChronoChatMessage[] => {
      if (typeof item !== "object" || item === null) return [];
      const candidate = item as Record<string, unknown>;
      if (
        (candidate.role !== "user" && candidate.role !== "assistant") ||
        typeof candidate.content !== "string"
      ) {
        return [];
      }

      const content = candidate.content.trim().slice(0, 1_000);
      return content ? [{ role: candidate.role, content }] : [];
    })
    .slice(-MAX_SESSION_MESSAGES);
}

function lastUserIndex(messages: readonly ChronoChatMessage[]): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "user") return index;
  }
  return -1;
}

function assessmentForModel(assessment: TimeIntegrityAssessment) {
  return {
    contamination: assessment.contamination,
    classification: assessment.classification,
    integrity_delta: assessment.integrityDelta,
    anachronism: assessment.anachronism,
    explanation: assessment.explanation,
    concept_id: assessment.conceptId,
    is_repeat: assessment.isRepeat,
  };
}

function extractResponseText(payload: ResponsesPayload): string {
  if (typeof payload.output_text === "string") return payload.output_text;
  if (!Array.isArray(payload.output)) return "";

  for (const item of payload.output) {
    if (typeof item !== "object" || item === null) continue;
    const outputItem = item as Record<string, unknown>;
    if (!Array.isArray(outputItem.content)) continue;

    for (const content of outputItem.content) {
      if (typeof content !== "object" || content === null) continue;
      const outputContent = content as Record<string, unknown>;
      if (
        outputContent.type === "output_text" &&
        typeof outputContent.text === "string"
      ) {
        return outputContent.text;
      }
    }
  }

  return "";
}

function parseModelReply(value: string): ModelReply {
  const parsed = JSON.parse(value) as Record<string, unknown>;
  const classification = parsed.classification;

  if (
    typeof parsed.reply !== "string" ||
    typeof parsed.contamination !== "boolean" ||
    (classification !== "harmless" &&
      classification !== "probable" &&
      classification !== "definite") ||
    typeof parsed.integrity_delta !== "number" ||
    !Number.isInteger(parsed.integrity_delta) ||
    parsed.integrity_delta < -12 ||
    parsed.integrity_delta > 0 ||
    typeof parsed.anachronism !== "string" ||
    typeof parsed.explanation !== "string" ||
    typeof parsed.concept_id !== "string" ||
    typeof parsed.is_repeat !== "boolean"
  ) {
    throw new Error("AI response did not match the expected schema.");
  }

  return {
    reply: parsed.reply,
    contamination: parsed.contamination,
    classification,
    integrity_delta: parsed.integrity_delta,
    anachronism: parsed.anachronism,
    explanation: parsed.explanation,
    concept_id: parsed.concept_id,
    is_repeat: parsed.is_repeat,
  };
}

function modelAssessmentMatches(
  modelReply: ModelReply,
  assessment: TimeIntegrityAssessment,
): boolean {
  return (
    modelReply.contamination === assessment.contamination &&
    modelReply.classification === assessment.classification &&
    modelReply.integrity_delta === assessment.integrityDelta &&
    modelReply.concept_id === assessment.conceptId &&
    modelReply.is_repeat === assessment.isRepeat
  );
}

function deterministicFallback(
  messages: readonly ChronoChatMessage[],
  reason: string,
) {
  return NextResponse.json(createDeterministicChronoReply(messages, reason));
}

class ProviderFailure extends Error {
  constructor(readonly reason: string) {
    super(reason);
  }
}

function providerErrorReason(
  provider: LiveAIProvider,
  status: number,
): string {
  if (status === 401 || status === 403) return `${provider}_auth_error`;
  if (status === 429) return `${provider}_rate_limited`;
  return `${provider}_unavailable`;
}

async function generateWithOpenAI(
  conversation: readonly ChronoChatMessage[],
  authoritativeAssessment: ReturnType<typeof assessmentForModel>,
  apiKey: string,
): Promise<ModelReply> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.6",
      reasoning: { effort: "low" },
      instructions: `${SAM_INSTRUCTIONS} Authoritative assessment JSON: ${JSON.stringify(authoritativeAssessment)}`,
      input: conversation.slice(-MAX_MODEL_MESSAGES),
      max_output_tokens: 450,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "chrono_character_reply",
          strict: true,
          schema: CHARACTER_REPLY_SCHEMA,
        },
        verbosity: "low",
      },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    console.error("OpenAI API error", response.status);
    throw new ProviderFailure(providerErrorReason("openai", response.status));
  }

  const payload = (await response.json()) as ResponsesPayload;
  if (payload.status === "incomplete") {
    throw new ProviderFailure("openai_incomplete");
  }

  return parseModelReply(extractResponseText(payload));
}

async function generateWithGemini(
  conversation: readonly ChronoChatMessage[],
  authoritativeAssessment: ReturnType<typeof assessmentForModel>,
  apiKey: string,
): Promise<ModelReply> {
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${SAM_INSTRUCTIONS} Authoritative assessment JSON: ${JSON.stringify(authoritativeAssessment)}`,
            },
          ],
        },
        contents: conversation.slice(-MAX_MODEL_MESSAGES).map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          maxOutputTokens: 450,
          responseMimeType: "application/json",
          responseJsonSchema: CHARACTER_REPLY_SCHEMA,
        },
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!response.ok) {
    console.error("Gemini API error", response.status);
    throw new ProviderFailure(providerErrorReason("gemini", response.status));
  }

  const payload = (await response.json()) as GeminiPayload;
  const candidate = payload.candidates?.[0];
  if (!candidate || candidate.finishReason === "MAX_TOKENS") {
    throw new ProviderFailure("gemini_incomplete");
  }

  const text = candidate.content?.parts
    ?.map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) throw new ProviderFailure("gemini_invalid_response");
  return parseModelReply(text);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = safeMessages(
    typeof body === "object" && body !== null
      ? (body as { messages?: unknown }).messages
      : undefined,
  );
  const latestIndex = lastUserIndex(messages);

  if (latestIndex < 0) {
    return NextResponse.json(
      { error: "At least one user message is required." },
      { status: 400 },
    );
  }

  const conversation = messages.slice(0, latestIndex + 1);
  const assessment = assessConversation(conversation);
  const provider = selectAIProvider({
    preference: process.env.AI_PROVIDER,
    geminiKey: process.env.GEMINI_API_KEY,
    openAIKey: process.env.OPENAI_API_KEY,
  });

  if (!provider) {
    return deterministicFallback(conversation, "missing_api_key");
  }

  const authoritativeAssessment = assessmentForModel(assessment);

  try {
    const apiKey =
      provider === "gemini"
        ? process.env.GEMINI_API_KEY?.trim()
        : process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return deterministicFallback(conversation, "missing_api_key");

    const modelReply =
      provider === "gemini"
        ? await generateWithGemini(
            conversation,
            authoritativeAssessment,
            apiKey,
          )
        : await generateWithOpenAI(
            conversation,
            authoritativeAssessment,
            apiKey,
          );

    if (!modelAssessmentMatches(modelReply, assessment)) {
      return deterministicFallback(conversation, "model_assessment_mismatch");
    }

    if (!isPeriodSafeReply(modelReply.reply, assessment)) {
      return deterministicFallback(conversation, "period_guard_rejected");
    }

    if (
      !isHistoricallyCalibratedReply(
        modelReply.reply,
        conversation,
        assessment,
      )
    ) {
      return deterministicFallback(conversation, "dialogue_calibration_rejected");
    }

    return NextResponse.json({
      reply: modelReply.reply.trim(),
      ...assessment,
      mode: "ai",
      provider,
    } satisfies ChronoReply);
  } catch (error) {
    const reason =
      error instanceof ProviderFailure
        ? error.reason
        : error instanceof DOMException &&
            (error.name === "TimeoutError" || error.name === "AbortError")
          ? `${provider}_timeout`
          : error instanceof TypeError
            ? `${provider}_unavailable`
            : `${provider}_invalid_response`;
    console.error("Chrono chat route failed", error);
    return deterministicFallback(conversation, reason);
  }
}
