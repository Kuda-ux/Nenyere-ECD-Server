/**
 * EmojiText — renders text that contains emoji with the emoji
 * blown up large and the label text below it.
 * Designed for 4-6 year olds: visuals are big, bold, and unmissable.
 */
"use client";

const EMOJI_RE = /(\p{Extended_Pictographic}(?:\uFE0F)?(?:\u{1F3FB}-\u{1F3FF})?)/u;

export function EmojiText({
  text,
  emojiClassName = "text-6xl",
  labelClassName = "text-base font-bold",
  stack = true,
}: {
  text: string;
  emojiClassName?: string;
  labelClassName?: string;
  stack?: boolean;
}) {
  const match = text.match(EMOJI_RE);
  const emoji = match?.[0] ?? "";
  const label = text.replace(EMOJI_RE, "").trim();

  if (!emoji) {
    return (
      <span className={labelClassName} style={{ fontFamily: "var(--font-kids)" }}>
        {text}
      </span>
    );
  }

  if (stack) {
    return (
      <span className="flex flex-col items-center gap-1">
        <span
          className={`${emojiClassName} leading-none drop-shadow-md`}
          aria-hidden="true"
        >
          {emoji}
        </span>
        {label && (
          <span
            className={labelClassName}
            style={{ fontFamily: "var(--font-kids)" }}
          >
            {label}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${emojiClassName} leading-none`} aria-hidden="true">
        {emoji}
      </span>
      {label && (
        <span className={labelClassName} style={{ fontFamily: "var(--font-kids)" }}>
          {label}
        </span>
      )}
    </span>
  );
}
