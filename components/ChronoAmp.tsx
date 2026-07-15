"use client";

import { useEffect, useRef, useState } from "react";

const tracks = [
  {
    title: "Temporal Buffer",
    style: "tracker module · 01:12",
    tempo: 132,
    notes: [262, 330, 392, 523, 392, 330, 294, 392, 440, 523, 659, 523, 440, 392, 330, 294],
  },
  {
    title: "Modem After Midnight",
    style: "chip loop · 00:58",
    tempo: 116,
    notes: [220, 277, 330, 440, 330, 277, 247, 330, 370, 440, 554, 440, 370, 330, 277, 247],
  },
  {
    title: "Pixel Food",
    style: "game mix · 01:04",
    tempo: 148,
    notes: [330, 392, 494, 659, 494, 392, 349, 440, 523, 698, 523, 440, 392, 349, 294, 392],
  },
] as const;

function scheduleTrack(
  track: (typeof tracks)[number],
  volume: number,
  onFinished: () => void,
) {
  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return undefined;

  const context = new AudioContextClass();
  const master = context.createGain();
  const beat = 60 / track.tempo;
  const start = context.currentTime + 0.04;
  master.gain.setValueAtTime(Math.max(0.0001, volume * 0.12), start);
  master.connect(context.destination);

  track.notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + index * beat * 0.5;
    oscillator.type = index % 4 === 0 ? "square" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.22, noteStart + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + beat * 0.42);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + beat * 0.45);

    if (index % 2 === 0) {
      const bass = context.createOscillator();
      const bassGain = context.createGain();
      bass.type = "sine";
      bass.frequency.setValueAtTime(frequency / 2, noteStart);
      bassGain.gain.setValueAtTime(0.0001, noteStart);
      bassGain.gain.exponentialRampToValueAtTime(0.13, noteStart + 0.02);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + beat * 0.8);
      bass.connect(bassGain);
      bassGain.connect(master);
      bass.start(noteStart);
      bass.stop(noteStart + beat * 0.82);
    }
  });

  void context.resume();
  let stopped = false;
  const duration = track.notes.length * beat * 0.5 + 0.2;
  const timer = window.setTimeout(() => {
    if (stopped) return;
    stopped = true;
    void context.close();
    onFinished();
  }, duration * 1_000);

  return () => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(timer);
    if (context.state !== "closed") void context.close();
  };
}

export function ChronoAmp() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const stopRef = useRef<(() => void) | null>(null);
  const track = tracks[trackIndex];

  function stop() {
    stopRef.current?.();
    stopRef.current = null;
    setIsPlaying(false);
  }

  function play() {
    stopRef.current?.();
    const cleanup = scheduleTrack(track, volume, () => {
      stopRef.current = null;
      setIsPlaying(false);
    });
    if (!cleanup) return;
    stopRef.current = cleanup;
    setIsPlaying(true);
  }

  function changeTrack(direction: -1 | 1) {
    stop();
    setTrackIndex((current) => (current + direction + tracks.length) % tracks.length);
  }

  useEffect(() => () => stopRef.current?.(), []);

  return (
    <div className="chrono-amp">
      <header><strong>CHRONOAMP</strong><span>original tracker audio</span></header>
      <div className="amp-display">
        <span>{String(trackIndex + 1).padStart(2, "0")}</span>
        <div><strong>{track.title}</strong><small>{track.style}</small></div>
        <em>{isPlaying ? "PLAY" : "STOP"}</em>
      </div>
      <div className={`amp-visualizer ${isPlaying ? "playing" : ""}`} aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} style={{ animationDelay: `${(index % 7) * -80}ms` }} />
        ))}
      </div>
      <div className="amp-controls" aria-label="Media controls">
        <button type="button" onClick={() => changeTrack(-1)} aria-label="Previous track">◀◀</button>
        <button type="button" onClick={isPlaying ? stop : play}>{isPlaying ? "■ Stop" : "▶ Play"}</button>
        <button type="button" onClick={() => changeTrack(1)} aria-label="Next track">▶▶</button>
      </div>
      <label className="amp-volume">
        Volume
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="ChronoAmp volume"
        />
      </label>
      <ol className="amp-playlist">
        {tracks.map((entry, index) => (
          <li key={entry.title} className={index === trackIndex ? "selected" : ""}>
            <button type="button" onClick={() => { stop(); setTrackIndex(index); }}>
              {index + 1}. {entry.title}
            </button>
          </li>
        ))}
      </ol>
      <small className="amp-note">All tracks are original browser-synthesized loops created for Chrono.</small>
    </div>
  );
}
