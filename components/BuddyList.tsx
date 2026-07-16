"use client";

import { useState } from "react";

const buddies = [
  {
    id: "sam",
    screenName: "sam_carter98",
    name: "Sam Carter",
    status: "Online",
    icon: "SC",
    profile: "PC games, skating, music, and learning HTML by breaking it.",
  },
  {
    id: "maya",
    screenName: "maya_sk8",
    name: "Maya Rivera",
    status: "Away: dinner, brb",
    icon: "MR",
    profile: "Skate videos, zines, mixtapes, and convincing friends to sign her guestbook.",
  },
  {
    id: "dev",
    screenName: "d3v_null",
    name: "Derek Wu",
    status: "Online",
    icon: "DW",
    profile: "Linux, shareware, Quake II maps, and insisting his computer is a server.",
  },
  {
    id: "jen",
    screenName: "jenAFK",
    name: "Jen Brooks",
    status: "Away: on the phone",
    icon: "JB",
    profile: "Local shows, disposable cameras, and a very carefully curated CD binder.",
  },
] as const;

export function BuddyList({ onMessageSam }: { onMessageSam: () => void }) {
  const [selectedId, setSelectedId] = useState<
    (typeof buddies)[number]["id"]
  >(buddies[0].id);
  const selected = buddies.find((buddy) => buddy.id === selectedId) ?? buddies[0];

  return (
    <div className="buddy-app">
      <header className="buddy-brand">
        <span aria-hidden="true">⚡</span>
        <div><strong>Chrono Messenger</strong><small>4 buddies · fictional reconstruction</small></div>
      </header>
      <div className="buddy-layout">
        <aside className="buddy-list" aria-label="Buddy list">
          <strong className="buddy-group">▼ Buddies (4/4)</strong>
          {buddies.map((buddy) => (
            <button
              type="button"
              key={buddy.id}
              className={selected.id === buddy.id ? "selected" : ""}
              onClick={() => setSelectedId(buddy.id)}
              aria-pressed={selected.id === buddy.id}
            >
              <span className="buddy-online" aria-hidden="true" />
              <span><strong>{buddy.screenName}</strong><small>{buddy.status}</small></span>
            </button>
          ))}
        </aside>
        <section className="buddy-profile">
          <div className="buddy-avatar" aria-hidden="true">{selected.icon}</div>
          <p className="win-kicker">FICTIONAL PROFILE</p>
          <h2>{selected.name}</h2>
          <strong>{selected.screenName}</strong>
          <span className="buddy-status">{selected.status}</span>
          <p>{selected.profile}</p>
          {selected.id === "sam" ? (
            <button type="button" onClick={onMessageSam}>Send Sam an IM</button>
          ) : (
            <small>Temporal messaging is currently connected only to Sam.</small>
          )}
        </section>
      </div>
    </div>
  );
}
