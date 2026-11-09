"use client";

import { Square, Volume2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

type ReadAloudButtonProps = {
  text: string;
  languageTag: string;
};

const subscribeNever = () => () => {};

export function ReadAloudButton({ text, languageTag }: ReadAloudButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const supported = useSyncExternalStore(
    subscribeNever,
    () => "speechSynthesis" in window,
    () => false,
  );

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageTag;
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-accent"
    >
      {speaking ? <Square className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
      {speaking ? "Stop reading" : "Read aloud"}
    </button>
  );
}
