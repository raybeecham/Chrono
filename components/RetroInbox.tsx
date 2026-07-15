"use client";

import { useState } from "react";

const messages = [
  {
    id: "sam",
    from: "Sam Carter <sam98@chrononet.net>",
    subject: "you made it!!!",
    date: "12/04/98 6:12 PM",
    label: "Fictional",
    body: [
      "Hey—welcome to Austin. Sorry the phone line was busy. I was uploading one picture to my homepage and it took approximately forever.",
      "Check out the shuttle news, sign my guestbook, and message me if you want game recommendations. Do not tell my parents how late I’m online.",
      "— Sam",
    ],
  },
  {
    id: "isp",
    from: "ChronoNet Member Services",
    subject: "Welcome to your 56k Internet trial",
    date: "12/04/98 5:47 PM",
    label: "Representative",
    body: [
      "Your trial includes ten hours of Internet access and one electronic mailbox.",
      "Remember: connecting to ChronoNet may occupy your household telephone line. Long-distance charges may apply when traveling outside the local access area.",
    ],
  },
  {
    id: "chain",
    from: "Maya R. <maya_sk8@chrononet.net>",
    subject: "FWD: send this to 10 people!!!",
    date: "12/03/98 9:03 PM",
    label: "Fictional",
    body: [
      "My cousin says this message has traveled around the entire Internet. Forward it to ten people before midnight for excellent luck.",
      "This is fictional atmosphere representing the chain-email style of the period—not a real archived message.",
    ],
  },
  {
    id: "y2k",
    from: "Dad <familycomputer@chrononet.net>",
    subject: "Y2K article",
    date: "12/02/98 7:31 AM",
    label: "Representative",
    body: [
      "I printed an article about the Year 2000 computer problem and left it beside the monitor. Please do not install anything while I’m at work.",
      "Public concern about Y2K was widespread by late 1998; this household message is a representative reconstruction.",
    ],
  },
  {
    id: "spam",
    from: "MEGA WEB PROMOTIONS",
    subject: "MAKE $$$ FROM YOUR HOME PAGE",
    date: "12/01/98 2:16 AM",
    label: "Representative",
    body: [
      "CONGRATULATIONS, WEBMASTER! Your page has been selected for an amazing traffic opportunity.",
      "Unsolicited commercial email already existed in the 1990s. This harmless example is newly written for Chrono.",
    ],
  },
] as const;

export function RetroInbox() {
  const [selectedId, setSelectedId] = useState<
    (typeof messages)[number]["id"]
  >(messages[0].id);
  const [unread, setUnread] = useState(() =>
    messages.map((message) => message.id),
  );
  const selected = messages.find((message) => message.id === selectedId) ?? messages[0];

  function selectMessage(id: (typeof messages)[number]["id"]) {
    setSelectedId(id);
    setUnread((current) => current.filter((messageId) => messageId !== id));
  }

  return (
    <div className="retro-inbox">
      <header className="inbox-toolbar">
        <button type="button" onClick={() => setUnread([])}>Mark all read</button>
        <span>{unread.length} unread message{unread.length === 1 ? "" : "s"}</span>
      </header>
      <div className="inbox-layout">
        <aside aria-label="Inbox messages">
          <strong className="inbox-folder">📥 Inbox ({messages.length})</strong>
          <div className="inbox-message-list">
            {messages.map((message) => (
              <button
                type="button"
                key={message.id}
                className={`${selected.id === message.id ? "selected" : ""} ${unread.includes(message.id) ? "unread" : ""}`}
                onClick={() => selectMessage(message.id)}
                aria-pressed={selected.id === message.id}
              >
                <strong>{message.subject}</strong>
                <span>{message.from.split(" <")[0]}</span>
                <small>{message.date}</small>
              </button>
            ))}
          </div>
        </aside>
        <article className="inbox-reading-pane">
          <header>
            <h2>{selected.subject}</h2>
            <dl>
              <div><dt>From:</dt><dd>{selected.from}</dd></div>
              <div><dt>Date:</dt><dd>{selected.date}</dd></div>
            </dl>
            <span className={`evidence-badge ${selected.label.toLowerCase()}`}>
              {selected.label}
            </span>
          </header>
          <div className="inbox-body">
            {selected.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>
      </div>
    </div>
  );
}
