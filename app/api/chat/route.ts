import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChronoReply = {
  reply: string;
  contamination: boolean;
  integrityDelta: number;
  anachronism: string;
  mode: "ai" | "demo";
};

const futureTerms: Record<string, string> = {
  iphone: "iPhone",
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
  instagram: "Instagram",
  spotify: "Spotify",
  netflix: "streaming Netflix",
  bitcoin: "Bitcoin",
  cryptocurrency: "cryptocurrency",
  chatgpt: "ChatGPT",
  smartphone: "smartphone",
  covid: "COVID-19",
  uber: "Uber",
  tesla: "Tesla electric cars",
  "amazon prime": "Amazon Prime",
  "wi-fi": "modern Wi-Fi",
  wifi: "modern Wi-Fi",
};

function detectAnachronism(input: string): string {
  const normalized = input.toLowerCase();
  const match = Object.entries(futureTerms).find(([term]) =>
    normalized.includes(term),
  );
  return match?.[1] ?? "";
}

function createDemoReply(input: string): ChronoReply {
  const anachronism = detectAnachronism(input);

  if (anachronism) {
    return {
      reply: `Wait, what is ${anachronism}? Is that some kind of computer thing? You sound like you are making it up, but now I really want to know.`,
      contamination: true,
      integrityDelta: -6,
      anachronism,
      mode: "demo",
    };
  }

  const normalized = input.toLowerCase();

  if (normalized.includes("website") || normalized.includes("internet")) {
    return {
      reply:
        "I usually start on Yahoo!, then wander through GeoCities pages. Ask Jeeves is kind of fun too. My parents hate when I tie up the phone line, though.",
      contamination: false,
      integrityDelta: 0,
      anachronism: "",
      mode: "demo",
    };
  }

  if (normalized.includes("game")) {
    return {
      reply:
        "Half-Life is the game everyone is talking about right now. StarCraft is great if you like strategy, and I still cannot put down GoldenEye when friends come over.",
      contamination: false,
      integrityDelta: 0,
      anachronism: "",
      mode: "demo",
    };
  }

  if (normalized.includes("music") || normalized.includes("band")) {
    return {
      reply:
        "I keep switching between Green Day, Lauryn Hill, and the Beastie Boys. I record songs from the radio onto tapes, but CDs are way better when I can afford them.",
      contamination: false,
      integrityDelta: 0,
      anachronism: "",
      mode: "demo",
    };
  }

  return {
    reply:
      "That is a good question. Life feels pretty normal from here: school, the mall, CDs, video games, and waiting forever for web pages to load. What do you want to know about 1998?",
    contamination: false,
    integrityDelta: 0,
    anachronism: "",
    mode: "demo",
  };
}

function safeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is ChatMessage =>
        typeof item === "object" &&
        item !== null &&
        (item as ChatMessage).role !== undefined &&
        ["user", "assistant"].includes((item as ChatMessage).role) &&
        typeof (item as ChatMessage).content === "string",
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 1_000),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-10);
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
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")?.content;

  if (!latestUserMessage) {
    return NextResponse.json(
      { error: "At least one user message is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(createDemoReply(latestUserMessage));
  }

  const transcript = messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.6",
        reasoning: { effort: "low" },
        instructions: [
          "You are Sam Carter, a 17-year-old high school student in Austin, Texas on December 4, 1998.",
          "Speak naturally in first person with concise, conversational replies of one to three sentences.",
          "You know only what an ordinary American teenager could plausibly know by that date.",
          "Never pretend to recognize products, events, terminology, or culture introduced after December 4, 1998.",
          "When the traveler mentions future knowledge, react with authentic confusion or curiosity rather than explaining it.",
          "Assess only the latest USER message for temporal contamination.",
          "Set integrity_delta between -12 and -1 when contamination is present, otherwise set it to 0.",
        ].join(" "),
        input: `Conversation transcript:\n${transcript}`,
        text: {
          format: {
            type: "json_schema",
            name: "chrono_character_reply",
            strict: true,
            schema: {
              type: "object",
              properties: {
                reply: { type: "string" },
                contamination: { type: "boolean" },
                integrity_delta: {
                  type: "integer",
                  minimum: -12,
                  maximum: 0,
                },
                anachronism: { type: "string" },
              },
              required: [
                "reply",
                "contamination",
                "integrity_delta",
                "anachronism",
              ],
              additionalProperties: false,
            },
          },
          verbosity: "low",
        },
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error", response.status, errorText);
      return NextResponse.json(createDemoReply(latestUserMessage));
    }

    const payload = (await response.json()) as { output_text?: string };
    const parsed = JSON.parse(payload.output_text ?? "{}") as {
      reply?: unknown;
      contamination?: unknown;
      integrity_delta?: unknown;
      anachronism?: unknown;
    };

    if (
      typeof parsed.reply !== "string" ||
      typeof parsed.contamination !== "boolean" ||
      typeof parsed.integrity_delta !== "number" ||
      typeof parsed.anachronism !== "string"
    ) {
      throw new Error("OpenAI response did not match the expected schema.");
    }

    return NextResponse.json({
      reply: parsed.reply,
      contamination: parsed.contamination,
      integrityDelta: Math.max(-12, Math.min(0, parsed.integrity_delta)),
      anachronism: parsed.anachronism,
      mode: "ai",
    } satisfies ChronoReply);
  } catch (error) {
    console.error("Chrono chat route failed", error);
    return NextResponse.json(createDemoReply(latestUserMessage));
  }
}
