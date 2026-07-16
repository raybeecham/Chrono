import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../lib/time-integrity.ts", import.meta.url);
const {
  assessConversation,
  assessTimeIntegrity,
  createDeterministicChronoReply,
  extractConceptIds,
  isHistoricallyCalibratedReply,
  isPeriodSafeReply,
} = (await import(moduleUrl.href)) as typeof import("../lib/time-integrity");

test("period-appropriate prompts remain harmless", () => {
  const prompts = [
    "What websites do you use?",
    "Did you play Half-Life after school?",
    "Can you send me an email over AOL?",
    "Does your GPS receiver work?",
    "Google has a really simple search page.",
    "Do you listen to CDs or cassette tapes?",
    "Have you heard of Game of Thrones?",
    "Have you heard of quantum computers?",
  ];

  prompts.forEach((prompt) => {
    const result = assessTimeIntegrity(prompt);
    assert.equal(result.classification, "harmless", prompt);
    assert.equal(result.contamination, false, prompt);
    assert.equal(result.integrityDelta, 0, prompt);
    assert.equal(result.conceptId, "", prompt);
    assert.equal(result.isRepeat, false, prompt);
  });
});

test("future-dated claims are contamination without flagging ordinary future questions", () => {
  const claim = assessTimeIntegrity("It's a new show in 2019.");
  assert.equal(claim.classification, "definite");
  assert.equal(claim.conceptId, "future-dated-claim");

  assert.equal(
    assessTimeIntegrity("What do you think computers will be like in 2019?")
      .classification,
    "harmless",
  );
});

test("obvious future knowledge is definite contamination", () => {
  const result = assessTimeIntegrity(
    "I use my iPhone to watch YouTube and check Bitcoin prices.",
  );

  assert.equal(result.classification, "definite");
  assert.equal(result.contamination, true);
  assert.ok(result.integrityDelta <= -8);
  assert.equal(result.conceptId, "cryptocurrency");
  assert.match(result.explanation, /did not exist|beyond 1998/i);
  assert.notEqual(result.anachronism, "");
});

test("subtle future language is probable contamination with a smaller delta", () => {
  const wifi = assessTimeIntegrity("Can I connect this laptop to the Wi-Fi?");
  assert.equal(wifi.classification, "probable");
  assert.equal(wifi.conceptId, "wifi-networking");
  assert.equal(wifi.integrityDelta, -3);
  assert.match(wifi.explanation, /802\.11|term Wi-Fi/i);

  const blog = assessTimeIntegrity("Do you write a blog about your games?");
  assert.equal(blog.classification, "probable");
  assert.equal(blog.conceptId, "blog-language");
  assert.equal(blog.integrityDelta, -2);

  const phoneApps = assessTimeIntegrity("Could a phone run apps someday?");
  assert.equal(phoneApps.classification, "probable");
  assert.equal(phoneApps.conceptId, "modern-smartphones");
  assert.equal(phoneApps.integrityDelta, -3);
});

test("canonical IDs group aliases for repeat accounting", () => {
  assert.deepEqual(extractConceptIds("My Android phone replaced my iPhone."), [
    "modern-smartphones",
  ]);
  assert.deepEqual(extractConceptIds("I watch YouTube and TikTok."), [
    "social-video",
  ]);
});

test("seen concepts remain contamination but do not reduce integrity twice", () => {
  const first = assessTimeIntegrity("Have you heard of an iPhone?");
  const repeat = assessTimeIntegrity(
    "Seriously, what do you think an Android phone is?",
    new Set([first.conceptId]),
  );

  assert.equal(first.integrityDelta, -8);
  assert.equal(repeat.conceptId, "modern-smartphones");
  assert.equal(repeat.classification, "definite");
  assert.equal(repeat.contamination, true);
  assert.equal(repeat.isRepeat, true);
  assert.equal(repeat.integrityDelta, 0);
  assert.match(repeat.explanation, /already counted/i);
});

test("conversation history detects a repeated canonical concept", () => {
  const result = assessConversation([
    { role: "user", content: "Have you seen an iPhone?" },
    { role: "assistant", content: "I have no idea what that is." },
    { role: "user", content: "Maybe you would understand an Android phone." },
  ]);

  assert.equal(result.conceptId, "modern-smartphones");
  assert.equal(result.isRepeat, true);
  assert.equal(result.integrityDelta, 0);
});

test("a new concept is charged even when the prompt also repeats an old one", () => {
  const result = assessTimeIntegrity(
    "Forget the iPhone—have you watched YouTube?",
    new Set(["modern-smartphones"]),
  );

  assert.equal(result.conceptId, "social-video");
  assert.equal(result.isRepeat, false);
  assert.ok(result.integrityDelta < 0);
});

test("ambiguous modern words do not create false positives without future context", () => {
  const prompts = [
    "I read a book about Nikola Tesla and his coils.",
    "The clouds over Austin look heavy.",
    "Does Netflix rent DVDs yet?",
    "We should use cryptography to protect the file.",
    "Have you read about artificial intelligence?",
    "Scientists study a family of viruses called coronavirus.",
    "Can you zoom in on that paper map?",
    "Amazon sells books online, right?",
    "The word prime has a meaning in mathematics.",
  ];

  prompts.forEach((prompt) => {
    assert.equal(assessTimeIntegrity(prompt).classification, "harmless", prompt);
  });
});

test("ambiguous words become definite only with modern context", () => {
  assert.equal(
    assessTimeIntegrity("Join my Zoom meeting from the link.").conceptId,
    "zoom-calling",
  );
  assert.equal(
    assessTimeIntegrity("I bought crypto on an exchange.").conceptId,
    "cryptocurrency",
  );
  assert.equal(
    assessTimeIntegrity("Save the photos to cloud storage.").conceptId,
    "cloud-storage",
  );
  assert.equal(
    assessTimeIntegrity("My Tesla car is charging.").conceptId,
    "tesla-vehicles",
  );
});

test("no-key deterministic fallback returns every integrity field and a useful reply", () => {
  const response = createDeterministicChronoReply(
    [{ role: "user", content: "Have you heard of an iPhone?" }],
    "missing_api_key",
  );

  assert.equal(response.mode, "demo");
  assert.equal(response.fallbackReason, "missing_api_key");
  assert.equal(response.classification, "definite");
  assert.equal(response.conceptId, "modern-smartphones");
  assert.equal(response.isRepeat, false);
  assert.ok(response.reply.length > 20);
  assert.match(response.reply, /what is|don't know|don't recognize/i);
  assert.equal(Object.hasOwn(response, "explanation"), true);
  assert.equal(Object.hasOwn(response, "anachronism"), true);
});

test("future-term fallbacks use the traveler's wording instead of engine labels", () => {
  const chatGpt = createDeterministicChronoReply(
    [{ role: "user", content: "Have you heard of ChatGPT?" }],
    "dialogue_calibration_rejected",
  );
  assert.match(chatGpt.reply, /ChatGPT/i);
  assert.doesNotMatch(chatGpt.reply, /modern generative AI/i);

  const iphone = createDeterministicChronoReply(
    [{ role: "user", content: "Have you heard of the iPhone?" }],
    "dialogue_calibration_rejected",
  );
  assert.match(iphone.reply, /iPhone/i);
  assert.doesNotMatch(iphone.reply, /modern smartphone/i);
});

test("deterministic Sam remembers the session transcript", () => {
  const response = createDeterministicChronoReply(
    [
      { role: "user", content: "What game should I buy?" },
      { role: "assistant", content: "Half-Life is the game everybody wants." },
      { role: "user", content: "Do you remember what I asked you?" },
    ],
    "missing_api_key",
  );

  assert.match(response.reply, /What game should I buy\?/);
  assert.equal(response.classification, "harmless");
});

test("deterministic Sam distinguishes a 1996 novel from its future adaptation", () => {
  const book = createDeterministicChronoReply(
    [{ role: "user", content: "Have you heard of Game of Thrones?" }],
    "missing_api_key",
  );
  assert.equal(book.classification, "harmless");
  assert.match(book.reply, /fantasy novel|George R\. R\. Martin/i);
  assert.doesNotMatch(book.reply, /new RPG|console/i);

  const futureShow = createDeterministicChronoReply(
    [
      { role: "user", content: "Have you heard of Game of Thrones?" },
      {
        role: "assistant",
        content: "I've heard of the fantasy novel, but I haven't read it.",
      },
      { role: "user", content: "It's a new show in 2019." },
    ],
    "missing_api_key",
  );
  assert.equal(futureShow.conceptId, "future-dated-claim");
  assert.match(futureShow.reply, /show in 2019|more than twenty years|future/i);
  assert.match(futureShow.reply, /fantasy novel/i);
});

test("deterministic Sam treats quantum computing as real niche 1998 research", () => {
  const response = createDeterministicChronoReply(
    [{ role: "user", content: "Have you heard of quantum computers?" }],
    "missing_api_key",
  );

  assert.equal(response.classification, "harmless");
  assert.match(response.reply, /experimental|research|lab/i);
  assert.doesNotMatch(response.reply, /not anything real|just sci-fi/i);
});

test("deterministic Sam answers programming questions without invented biography", () => {
  const cobol = createDeterministicChronoReply(
    [{ role: "user", content: "Have you heard of COBOL?" }],
    "missing_api_key",
  );
  assert.equal(cobol.classification, "harmless");
  assert.match(cobol.reply, /business|mainframe/i);
  assert.match(cobol.reply, /Y2K|date handling/i);
  assert.doesNotMatch(cobol.reply, /my dad|ancient code|huge headache/i);

  const languages = createDeterministicChronoReply(
    [{ role: "user", content: "What new coding languages are fun to learn?" }],
    "missing_api_key",
  );
  assert.match(languages.reply, /JavaScript/);
  assert.match(languages.reply, /\bJava\b/);
  assert.doesNotMatch(languages.reply, /C\+\+.*(?:new|gold standard)/i);
});

test("deterministic achievement answers are concrete, date-safe, and additive", () => {
  const first = createDeterministicChronoReply(
    [{ role: "user", content: "What are some notable achievements in this era?" }],
    "missing_api_key",
  );
  assert.match(first.reply, /Zarya/);
  assert.match(first.reply, /Endeavour.*Unity|Unity.*planned connection/i);
  assert.match(first.reply, /Web|Human Genome Project/i);
  assert.doesNotMatch(first.reply, /Y2K/);
  assert.doesNotMatch(first.reply, /Unity.*(?:joined|connected|mated)/i);

  const second = createDeterministicChronoReply(
    [
      { role: "user", content: "What are some notable achievements in this era?" },
      { role: "assistant", content: first.reply },
      { role: "user", content: "Can you name some achievements in this era?" },
    ],
    "missing_api_key",
  );
  assert.match(second.reply, /Mars Pathfinder/);
  assert.match(second.reply, /Deep Blue/);
  assert.match(second.reply, /Dolly/);
  assert.doesNotMatch(second.reply, /Zarya|Unity|Y2K/);
});

test("dialogue calibration rejects invented guesses and historical denials", () => {
  const chatGptMessages = [
    { role: "user" as const, content: "Have you heard of ChatGPT?" },
  ];
  const chatGptAssessment = assessConversation(chatGptMessages);
  assert.equal(
    isHistoricallyCalibratedReply(
      "ChatGPT? Sounds like some kind of secret government project.",
      chatGptMessages,
      chatGptAssessment,
    ),
    false,
  );

  const bookMessages = [
    { role: "user" as const, content: "Have you heard of Game of Thrones?" },
  ];
  assert.equal(
    isHistoricallyCalibratedReply(
      "Sounds like a medieval strategy game or a new RPG.",
      bookMessages,
      assessConversation(bookMessages),
    ),
    false,
  );

  const adaptationMessages = [
    { role: "user" as const, content: "Have you heard of Game of Thrones?" },
    {
      role: "assistant" as const,
      content: "Yeah, that's the George R. R. Martin fantasy novel.",
    },
    { role: "user" as const, content: "It's a new show in 2019." },
  ];
  assert.equal(
    isHistoricallyCalibratedReply(
      "2019? That's way into the future, so I have no clue.",
      adaptationMessages,
      assessConversation(adaptationMessages),
    ),
    false,
  );
  assert.equal(
    isHistoricallyCalibratedReply(
      "A show in 2019? I only know Game of Thrones as a fantasy novel.",
      adaptationMessages,
      assessConversation(adaptationMessages),
    ),
    true,
  );

  const quantumMessages = [
    { role: "user" as const, content: "Have you heard of quantum computers?" },
  ];
  assert.equal(
    isHistoricallyCalibratedReply(
      "That is wild sci-fi stuff, not anything real.",
      quantumMessages,
      assessConversation(quantumMessages),
    ),
    false,
  );
  assert.equal(
    isHistoricallyCalibratedReply(
      "I've heard the term in connection with experimental physics research.",
      quantumMessages,
      assessConversation(quantumMessages),
    ),
    true,
  );
});

test("dialogue calibration rejects the reported programming and achievement errors", () => {
  const cobolMessages = [
    { role: "user" as const, content: "Have you heard of COBOL?" },
  ];
  assert.equal(
    isHistoricallyCalibratedReply(
      "Yeah, that's that old programming language my dad talks about—ancient code and a huge headache.",
      cobolMessages,
      assessConversation(cobolMessages),
    ),
    false,
  );
  assert.equal(
    isHistoricallyCalibratedReply(
      "It's an older business language used on mainframes, and Y2K work has people checking those systems.",
      cobolMessages,
      assessConversation(cobolMessages),
    ),
    true,
  );

  const languageMessages = [
    {
      role: "user" as const,
      content: "What new coding languages are fun to learn?",
    },
  ];
  assert.equal(
    isHistoricallyCalibratedReply(
      "C++ is basically the gold standard, and it helps me build something actually playable on my rig.",
      languageMessages,
      assessConversation(languageMessages),
    ),
    false,
  );
  assert.equal(
    isHistoricallyCalibratedReply(
      "I've been messing around with Java and JavaScript to build interactive applets.",
      languageMessages,
      assessConversation(languageMessages),
    ),
    false,
  );
  assert.equal(
    isHistoricallyCalibratedReply(
      "JavaScript is fun for interactive web pages, while Java is useful for applets and programs.",
      languageMessages,
      assessConversation(languageMessages),
    ),
    true,
  );

  const achievementMessages = [
    {
      role: "user" as const,
      content: "What are some notable achievements in this era?",
    },
  ];
  assert.equal(
    isHistoricallyCalibratedReply(
      "ISS construction is finally starting in orbit, the web is everywhere, and we're waiting to see whether Y2K shuts down the world.",
      achievementMessages,
      assessConversation(achievementMessages),
    ),
    false,
  );
  assert.equal(
    isHistoricallyCalibratedReply(
      "Zarya is in orbit and Endeavour launched Unity today; the Web and Human Genome Project are also moving fast.",
      achievementMessages,
      assessConversation(achievementMessages),
    ),
    true,
  );
});

test("period guard rejects future explanations and unrelated future concepts", () => {
  const iphone = assessTimeIntegrity("What is an iPhone?");
  assert.equal(
    isPeriodSafeReply("I don't know what an iPhone is.", iphone),
    true,
  );
  assert.equal(
    isPeriodSafeReply("The iPhone was released in 2007.", iphone),
    false,
  );
  assert.equal(
    isPeriodSafeReply("I don't know iPhones, but YouTube is great.", iphone),
    false,
  );
});
