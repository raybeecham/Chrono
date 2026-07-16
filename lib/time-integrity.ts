export type TimeClassification = "harmless" | "probable" | "definite";

export type ChronoMode = "ai" | "demo";

export type ChronoChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TimeIntegrityAssessment = {
  contamination: boolean;
  classification: TimeClassification;
  integrityDelta: number;
  anachronism: string;
  explanation: string;
  conceptId: string;
  isRepeat: boolean;
};

export type ChronoReply = TimeIntegrityAssessment & {
  reply: string;
  mode: ChronoMode;
  provider?: "gemini" | "openai";
  fallbackReason?: string;
};

type ConceptRule = {
  id: string;
  classification: Exclude<TimeClassification, "harmless">;
  integrityDelta: number;
  anachronism: string;
  explanation: string;
  patterns: readonly RegExp[];
};

const conceptRules: readonly ConceptRule[] = [
  {
    id: "modern-smartphones",
    classification: "definite",
    integrityDelta: -8,
    anachronism: "iPhone or modern smartphone",
    explanation:
      "The iPhone and today's app-based phones did not exist by December 4, 1998.",
    patterns: [
      /\biphone(?:s)?\b/i,
      /\bandroid (?:phone|smartphone|device)s?\b/i,
      /\b(?:facetime|face id|siri)\b/i,
      /\b(?:touchscreen|app[- ]based) smartphone(?:s)?\b/i,
      /\bphone app store\b/i,
    ],
  },
  {
    id: "modern-smartphones",
    classification: "probable",
    integrityDelta: -3,
    anachronism: "modern smartphone",
    explanation:
      "An app-centered smartphone is not a normal consumer concept in December 1998.",
    patterns: [
      /\bsmart ?phone(?:s)?\b/i,
      /\bphones? (?:run|running|install|installing|download|downloading) apps?\b/i,
      /\bapps? (?:on|for) (?:a |my |your |the )?phones?\b/i,
    ],
  },
  {
    id: "social-video",
    classification: "definite",
    integrityDelta: -8,
    anachronism: "modern social video",
    explanation:
      "YouTube and TikTok were created years after this December 1998 setting.",
    patterns: [/\byoutube\b/i, /\btik ?tok\b/i],
  },
  {
    id: "social-platforms",
    classification: "definite",
    integrityDelta: -8,
    anachronism: "modern social platform",
    explanation:
      "That social platform did not exist by December 4, 1998.",
    patterns: [
      /\bfacebook\b/i,
      /\binstagram\b/i,
      /\bsnapchat\b/i,
      /\bmyspace\b/i,
      /\breddit\b/i,
      /\blinked ?in\b/i,
      /\bdiscord (?:app|server|chat)\b/i,
      /\btwitter (?:account|post|thread|feed)\b/i,
    ],
  },
  {
    id: "social-platforms",
    classification: "probable",
    integrityDelta: -3,
    anachronism: "social-media language",
    explanation:
      "Modern social-media language and hashtag culture developed after 1998.",
    patterns: [
      /\bsocial media\b/i,
      /\bsocial[- ]media (?:post|profile|feed|account)s?\b/i,
      /\bhashtag(?:s)?\b/i,
    ],
  },
  {
    id: "streaming-media",
    classification: "definite",
    integrityDelta: -8,
    anachronism: "subscription streaming",
    explanation:
      "On-demand services such as Spotify and streaming Netflix came well after 1998.",
    patterns: [
      /\bspotify\b/i,
      /\bhulu\b/i,
      /\bnetflix (?:streaming|stream|app|show|series)\b/i,
      /\b(?:stream|streaming|watch)(?:ing)? (?:it |that |movies? |shows? )?(?:on|with) netflix\b/i,
      /\bbinge[- ]watch(?:ing|ed)?\b/i,
    ],
  },
  {
    id: "cryptocurrency",
    classification: "definite",
    integrityDelta: -10,
    anachronism: "cryptocurrency",
    explanation:
      "Bitcoin and modern cryptocurrencies did not exist in December 1998.",
    patterns: [
      /\bbitcoin\b/i,
      /\bcrypto ?currency(?:ies)?\b/i,
      /\bethereum\b/i,
      /\b(?:nft|nfts|non[- ]fungible token)s?\b/i,
      /\b(?:buy|bought|sell|sold|trade|trading|invest(?:ed|ing)? in|mine|mining) crypto\b/i,
      /\bcrypto (?:coin|coins|token|tokens|wallet|exchange|market)\b/i,
    ],
  },
  {
    id: "generative-ai",
    classification: "definite",
    integrityDelta: -9,
    anachronism: "modern generative AI",
    explanation:
      "ChatGPT and modern large-language-model assistants are decades beyond 1998.",
    patterns: [
      /\bchat ?gpt\b/i,
      /\bgpt[- ]?[3-9]\b/i,
      /\blarge language model(?:s)?\b/i,
      /\bllm(?:s)?\b/i,
      /\bgenerative ai\b/i,
      /\b(?:claude|gemini) ai\b/i,
      /\bdall[- ]?e\b/i,
    ],
  },
  {
    id: "future-dated-claim",
    classification: "definite",
    integrityDelta: -7,
    anachronism: "post-1998 event stated as established fact",
    explanation:
      "The message presents something from after December 4, 1998 as already established.",
    patterns: [
      /\b(?:it(?:'s| is)|that(?:'s| is)|this(?:'s| is))\b[^.!?]{0,80}\b(?:in|from) (?:1999|20\d{2})\b/i,
      /\b(?:came out|premiered|released|launched|started|happened|aired|was new)\b[^.!?]{0,80}\b(?:1999|20\d{2})\b/i,
      /\b(?:in|from) (?:1999|20\d{2})\b[^.!?]{0,80}\b(?:show|movie|game|product|service|event|album|book)\b/i,
    ],
  },
  {
    id: "covid-19",
    classification: "definite",
    integrityDelta: -12,
    anachronism: "COVID-19 pandemic",
    explanation:
      "COVID-19 and its pandemic occurred more than two decades after December 1998.",
    patterns: [
      /\bcovid(?:[- ]?19)?\b/i,
      /\bcoronavirus (?:pandemic|lockdown|vaccine)\b/i,
      /\b(?:pandemic|lockdown) (?:of |in )?2020\b/i,
    ],
  },
  {
    id: "app-based-transport",
    classification: "definite",
    integrityDelta: -7,
    anachronism: "app-based transport or delivery",
    explanation:
      "Ride-hailing and delivery apps such as Uber and DoorDash did not exist in 1998.",
    patterns: [
      /\buber (?:app|ride|driver|eats)\b/i,
      /\blyft\b/i,
      /\bdoor ?dash\b/i,
      /\bgrub ?hub\b/i,
      /\bairbnb\b/i,
      /\bride[- ]shar(?:e|ing) app\b/i,
    ],
  },
  {
    id: "cloud-storage",
    classification: "definite",
    integrityDelta: -7,
    anachronism: "consumer cloud storage",
    explanation:
      "Modern consumer cloud-storage services arrived after December 1998.",
    patterns: [
      /\bicloud\b/i,
      /\bgoogle drive\b/i,
      /\bdropbox\b/i,
      /\bone ?drive\b/i,
      /\bcloud (?:storage|backup|sync|drive)\b/i,
      /\b(?:save|upload|back (?:it|this) up) (?:it |this |that )?(?:to|in) the cloud\b/i,
    ],
  },
  {
    id: "tesla-vehicles",
    classification: "definite",
    integrityDelta: -7,
    anachronism: "Tesla vehicle",
    explanation:
      "Tesla the automaker and its electric cars did not exist in 1998.",
    patterns: [
      /\btesla (?:car|cars|vehicle|vehicles|model [3sxy]|cybertruck|autopilot)\b/i,
      /\b(?:drive|driving|drove|buy|bought|own|charge|charging) (?:a |my |the )?tesla\b/i,
    ],
  },
  {
    id: "wifi-networking",
    classification: "probable",
    integrityDelta: -3,
    anachronism: "Wi-Fi",
    explanation:
      "The consumer term Wi-Fi was introduced after December 1998, although early 802.11 already existed.",
    patterns: [/\bwi[- ]?fi\b/i, /\bwireless router\b/i, /\bwifi hotspot\b/i],
  },
  {
    id: "usb-flash-storage",
    classification: "definite",
    integrityDelta: -6,
    anachronism: "USB flash drive",
    explanation:
      "USB flash drives became available after 1998.",
    patterns: [
      /\busb (?:flash |thumb )?drive\b/i,
      /\busb stick\b/i,
      /\bthumb drive\b/i,
    ],
  },
  {
    id: "wikipedia",
    classification: "definite",
    integrityDelta: -6,
    anachronism: "Wikipedia",
    explanation: "Wikipedia did not launch until after December 1998.",
    patterns: [/\bwikipedia\b/i],
  },
  {
    id: "modern-email",
    classification: "definite",
    integrityDelta: -5,
    anachronism: "modern email service",
    explanation: "That email service did not exist by December 4, 1998.",
    patterns: [/\bgmail\b/i, /\bproton ?mail\b/i],
  },
  {
    id: "amazon-prime",
    classification: "definite",
    integrityDelta: -6,
    anachronism: "Amazon Prime",
    explanation: "Amazon existed in 1998, but Amazon Prime did not.",
    patterns: [/\bamazon prime\b/i, /\bprime (?:video|delivery|shipping)\b/i],
  },
  {
    id: "zoom-calling",
    classification: "definite",
    integrityDelta: -6,
    anachronism: "Zoom video call",
    explanation: "Zoom's video-calling service did not exist in 1998.",
    patterns: [
      /\bzoom (?:call|meeting|app|link|room)\b/i,
      /\bjoin (?:a |the |my )?zoom\b/i,
    ],
  },
  {
    id: "phone-navigation",
    classification: "definite",
    integrityDelta: -6,
    anachronism: "modern phone navigation",
    explanation:
      "GPS existed, but modern phone navigation apps did not exist in 1998.",
    patterns: [
      /\bgoogle maps\b/i,
      /\bapple maps\b/i,
      /\b(?:gps|maps?|navigation) (?:app|on my phone)\b/i,
    ],
  },
  {
    id: "post-1998-apple-devices",
    classification: "definite",
    integrityDelta: -7,
    anachronism: "post-1998 Apple device",
    explanation: "That Apple device had not been introduced by December 1998.",
    patterns: [
      /\bipod\b/i,
      /\bipad\b/i,
      /\bapple watch\b/i,
      /\bair ?pods?\b/i,
    ],
  },
  {
    id: "post-1998-gaming",
    classification: "definite",
    integrityDelta: -7,
    anachronism: "post-1998 game platform",
    explanation: "That game platform was released after December 4, 1998.",
    patterns: [
      /\bplay ?station 2\b/i,
      /\b(?:original )?xbox\b/i,
      /\bgame ?cube\b/i,
      /\bnintendo (?:wii|switch)\b/i,
      /\bsteam (?:game|library|account|store)\b/i,
    ],
  },
  {
    id: "napster",
    classification: "definite",
    integrityDelta: -5,
    anachronism: "Napster",
    explanation: "Napster launched in 1999, after this December 1998 setting.",
    patterns: [/\bnapster\b/i],
  },
  {
    id: "podcasting",
    classification: "definite",
    integrityDelta: -5,
    anachronism: "podcast",
    explanation: "Podcasting and the word podcast emerged years after 1998.",
    patterns: [/\bpodcast(?:s|ing|er)?\b/i],
  },
  {
    id: "blog-language",
    classification: "probable",
    integrityDelta: -2,
    anachronism: "the word blog",
    explanation:
      "Weblogs existed, but the shortened word blog was coined after December 4, 1998.",
    patterns: [/\bblogs?\b/i, /\bblogg(?:er|ing|ed)\b/i],
  },
  {
    id: "emoji-language",
    classification: "probable",
    integrityDelta: -2,
    anachronism: "emoji",
    explanation:
      "Text emoticons existed, but emoji arrived after this December 1998 date.",
    patterns: [/\bemoji(?:s)?\b/i],
  },
  {
    id: "google-as-verb",
    classification: "probable",
    integrityDelta: -2,
    anachronism: "using Google as a verb",
    explanation:
      "Google existed, but saying “Google it” was not established language in December 1998.",
    patterns: [/\bgoogle (?:it|that|this|him|her|them)\b/i],
  },
  {
    id: "september-11-attacks",
    classification: "definite",
    integrityDelta: -10,
    anachronism: "September 11 attacks",
    explanation: "The September 11 attacks occurred after 1998.",
    patterns: [
      /\b(?:9\/11|september 11(?:th)?) (?:attack|attacks|terror|hijacking)s?\b/i,
      /\bafter (?:9\/11|september 11(?:th)?)\b/i,
    ],
  },
  {
    id: "future-us-presidents",
    classification: "definite",
    integrityDelta: -9,
    anachronism: "future U.S. presidency",
    explanation: "That presidency occurred after December 1998.",
    patterns: [
      /\bpresident (?:barack )?obama\b/i,
      /\bpresident (?:donald )?trump\b/i,
      /\bpresident (?:joe )?biden\b/i,
      /\b(?:obama|trump|biden) (?:administration|presidency)\b/i,
    ],
  },
  {
    id: "brexit",
    classification: "definite",
    integrityDelta: -7,
    anachronism: "Brexit",
    explanation: "The Brexit referendum and withdrawal occurred after 1998.",
    patterns: [/\bbrexit\b/i],
  },
];

const classificationRank: Record<TimeClassification, number> = {
  harmless: 0,
  probable: 1,
  definite: 2,
};

function findCandidates(input: string): ConceptRule[] {
  const strongestById = new Map<string, ConceptRule>();

  for (const rule of conceptRules) {
    if (!rule.patterns.some((pattern) => pattern.test(input))) continue;

    const existing = strongestById.get(rule.id);
    if (
      !existing ||
      classificationRank[rule.classification] >
        classificationRank[existing.classification] ||
      (rule.classification === existing.classification &&
        rule.integrityDelta < existing.integrityDelta)
    ) {
      strongestById.set(rule.id, rule);
    }
  }

  return [...strongestById.values()].sort((left, right) => {
    const classificationDifference =
      classificationRank[right.classification] -
      classificationRank[left.classification];
    if (classificationDifference !== 0) return classificationDifference;
    return left.integrityDelta - right.integrityDelta;
  });
}

export function extractConceptIds(input: string): string[] {
  return findCandidates(input).map((candidate) => candidate.id);
}

export function assessTimeIntegrity(
  input: string,
  seenConceptIds: Iterable<string> = [],
): TimeIntegrityAssessment {
  const candidates = findCandidates(input);

  if (candidates.length === 0) {
    return {
      contamination: false,
      classification: "harmless",
      integrityDelta: 0,
      anachronism: "",
      explanation: "No clear post-1998 knowledge was detected.",
      conceptId: "",
      isRepeat: false,
    };
  }

  const seen = new Set(seenConceptIds);
  const candidate =
    candidates.find((item) => !seen.has(item.id)) ?? candidates[0];
  const isRepeat = seen.has(candidate.id);

  return {
    contamination: true,
    classification: candidate.classification,
    integrityDelta: isRepeat ? 0 : candidate.integrityDelta,
    anachronism: candidate.anachronism,
    explanation: isRepeat
      ? `${candidate.explanation} This concept was already counted.`
      : candidate.explanation,
    conceptId: candidate.id,
    isRepeat,
  };
}

export function collectSeenConceptIds(
  messages: readonly ChronoChatMessage[],
  beforeIndex: number = messages.length,
): Set<string> {
  const seen = new Set<string>();

  messages.slice(0, beforeIndex).forEach((message) => {
    if (message.role !== "user") return;
    extractConceptIds(message.content).forEach((conceptId) => seen.add(conceptId));
  });

  return seen;
}

function latestUserIndex(messages: readonly ChronoChatMessage[]): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "user") return index;
  }
  return -1;
}

export function assessConversation(
  messages: readonly ChronoChatMessage[],
): TimeIntegrityAssessment {
  const latestIndex = latestUserIndex(messages);
  if (latestIndex < 0) return assessTimeIntegrity("");

  return assessTimeIntegrity(
    messages[latestIndex]?.content ?? "",
    collectSeenConceptIds(messages, latestIndex),
  );
}

function shortenedQuote(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 72 ? `${compact.slice(0, 69)}…` : compact;
}

function samFallbackReply(
  messages: readonly ChronoChatMessage[],
  assessment: TimeIntegrityAssessment,
): string {
  const latestIndex = latestUserIndex(messages);
  const input = messages[latestIndex]?.content ?? "";
  const normalized = input.toLowerCase();
  const previousUserMessage = [...messages.slice(0, latestIndex)]
    .reverse()
    .find((message) => message.role === "user");
  const travelerTerm =
    input.match(/\bchat ?gpt\b/i)?.[0] ??
    input.match(/\b(?:iPhone|Android phone)\b/i)?.[0] ??
    assessment.anachronism;

  if (assessment.contamination) {
    if (
      assessment.conceptId === "future-dated-claim" &&
      previousUserMessage &&
      /\bgame of thrones\b/i.test(previousUserMessage.content)
    ) {
      return "A show in 2019? That's more than twenty years away. I only know A Game of Thrones as a fantasy novel—you're talking like something from the future already happened.";
    }

    if (assessment.isRepeat) {
      return `I still don't recognize ${travelerTerm}. You mentioned it before, but I need you to explain what you mean without assuming I know it.`;
    }

    if (assessment.classification === "probable") {
      return `I don't recognize the phrase ${travelerTerm}. What exactly do you mean by it?`;
    }

    if (assessment.conceptId === "future-dated-claim") {
      return "That date is way ahead of 1998, but you're describing it like it already happened. What are you talking about?";
    }

    return `I don't recognize ${travelerTerm}. You're talking like it's something I should already know—what exactly do you mean?`;
  }

  if (
    previousUserMessage &&
    /\b(?:remember|earlier|before|what did i (?:ask|say))\b/i.test(normalized)
  ) {
    return `Yeah, I remember. You asked, “${shortenedQuote(previousUserMessage.content)}” I haven't forgotten already.`;
  }

  if (/\b(?:who are you|about yourself|your name|how old)\b/i.test(normalized)) {
    return "I'm Sam Carter, 17, and I live in Austin. I'm into computer games and music, and I'm supposed to be finishing homework before I tie up the phone line again.";
  }

  if (/\b(?:date|what day|today|when is it)\b/i.test(normalized)) {
    return "It's Friday, December 4, 1998 here in Austin. The weekend is close, which is about all I'm thinking about right now.";
  }

  if (/\b(?:hey|hello|hi there|what's up|whats up)\b/i.test(normalized)) {
    return "Hey. I'm mostly avoiding homework and waiting to see if my friends are going to the mall later. What's up?";
  }

  if (/\bgame of thrones\b/i.test(normalized)) {
    return "I've heard of the fantasy novel by George R. R. Martin, but I haven't read it. Is it actually good, or is it one of those books everyone says they'll finish someday?";
  }

  if (/\bquantum comput(?:er|ers|ing)\b/i.test(normalized)) {
    return "I've heard the term, but only as really experimental physics-and-computer-science stuff. It sounds like something researchers can barely make work in a lab, not a computer anybody could actually buy.";
  }

  if (/\b(?:website|web site|internet|online|search engine)\b/i.test(normalized)) {
    return "I usually start on Yahoo!, then wander through GeoCities pages. Ask Jeeves is kind of fun too, but my parents hate when I tie up the phone line.";
  }

  if (/\b(?:game|gaming|video game|computer game)\b/i.test(normalized)) {
    return "Half-Life is the game everybody's talking about. I also play StarCraft, and GoldenEye is still the best when friends come over.";
  }

  if (/\b(?:music|band|album|song|listen)\b/i.test(normalized)) {
    return "I've got Lauryn Hill, Green Day, and the Beastie Boys in heavy rotation. I still tape songs off the radio when I don't have cash for a CD.";
  }

  if (/\b(?:movie|film|cinema|theater)\b/i.test(normalized)) {
    return "A Bug's Life just came out, and some friends want to see Enemy of the State. Movie tickets add up, though, so I may just rent something this weekend.";
  }

  if (/\b(?:phone|call|message|chat|email|e-mail|aim)\b/i.test(normalized)) {
    return "Mostly I use the house phone, email, and AIM when nobody needs the line. If I leave the computer, people just have to call back later.";
  }

  if (/\b(?:austin|texas|home town|hometown)\b/i.test(normalized)) {
    return "Austin's home. I mostly bounce between school, friends' houses, the mall, and anywhere I can look at computer stuff without buying it.";
  }

  return "Honestly, life is school, the mall, CDs, computer games, and waiting forever for web pages to load. What are you curious about?";
}

export function createDeterministicChronoReply(
  messages: readonly ChronoChatMessage[],
  fallbackReason?: string,
): ChronoReply {
  const assessment = assessConversation(messages);

  return {
    reply: samFallbackReply(messages, assessment),
    ...assessment,
    mode: "demo",
    ...(fallbackReason ? { fallbackReason } : {}),
  };
}

export function isPeriodSafeReply(
  reply: string,
  assessment: TimeIntegrityAssessment,
): boolean {
  const compact = reply.trim();
  if (compact.length === 0 || compact.length > 800) return false;

  const futureYear = "(?:1999|20\\d{2})";
  const futureFactPatterns = [
    new RegExp(
      `\\b(?:in|during|by) ${futureYear}[^.!?]{0,80}\\b(?:launched|released|happened|became|won|elected|founded|invented)\\b`,
      "i",
    ),
    new RegExp(
      `\\b(?:launched|released|happened|became|won|elected|founded|invented)\\b[^.!?]{0,80}\\b${futureYear}\\b`,
      "i",
    ),
    new RegExp(
      `\\b(?:won't|wouldn't|doesn't|didn't) (?:exist|happen|arrive|launch) until ${futureYear}\\b`,
      "i",
    ),
  ];

  if (futureFactPatterns.some((pattern) => pattern.test(compact))) return false;

  const replyConceptIds = extractConceptIds(compact);
  return replyConceptIds.every(
    (conceptId) => assessment.contamination && conceptId === assessment.conceptId,
  );
}

export function isHistoricallyCalibratedReply(
  reply: string,
  messages: readonly ChronoChatMessage[],
  assessment: TimeIntegrityAssessment,
): boolean {
  const latestIndex = latestUserIndex(messages);
  const latestInput = messages[latestIndex]?.content ?? "";
  const previousUserMessage = [...messages.slice(0, latestIndex)]
    .reverse()
    .find((message) => message.role === "user");

  if (
    assessment.contamination &&
    /\b(?:sounds like|some kind of|maybe (?:it(?:'s| is)|that(?:'s| is))|probably (?:a|some)|must be)\b/i.test(
      reply,
    )
  ) {
    return false;
  }

  if (/\bgame of thrones\b/i.test(latestInput)) {
    return /\b(?:book|novel|fantasy|george r\.? r\.? martin|martin)\b/i.test(
      reply,
    );
  }

  if (
    assessment.conceptId === "future-dated-claim" &&
    previousUserMessage &&
    /\bgame of thrones\b/i.test(previousUserMessage.content)
  ) {
    return /\b(?:game of thrones|book|novel)\b/i.test(reply);
  }

  if (/\bquantum comput(?:er|ers|ing)\b/i.test(latestInput)) {
    if (/\b(?:not (?:anything )?real|just sci[- ]?fi|wild sci[- ]?fi)\b/i.test(reply)) {
      return false;
    }

    return /\b(?:research|experiment|laborator|scientist|physics|heard (?:of )?(?:the )?(?:term|idea))\b/i.test(
      reply,
    );
  }

  return true;
}
