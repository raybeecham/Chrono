import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../lib/time-integrity.ts", import.meta.url);
const {
  assessConversation,
  assessTimeIntegrity,
  createDeterministicChronoReply,
  extractConceptIds,
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
  assert.match(response.reply, /what is|don't know/i);
  assert.equal(Object.hasOwn(response, "explanation"), true);
  assert.equal(Object.hasOwn(response, "anachronism"), true);
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
