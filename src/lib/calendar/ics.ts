export type CalendarItem = {
  id: string;
  title: string;
  description: string;
  consequence: string;
  /** ISO timestamp at midnight UTC. Undated items are skipped. */
  dueDate: string | null;
};

function escapeText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\;")
    .replaceAll(",", "\\,")
    .replaceAll(/\r?\n/g, "\\n");
}

/** RFC 5545 limits lines to 75 octets; longer ones continue after CRLF + space. */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    if (encoder.encode(current + char).length > 73) {
      parts.push(current);
      current = "";
    }
    current += char;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function compactDate(iso: string): string {
  return iso.slice(0, 10).replaceAll("-", "");
}

function nextDay(iso: string): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + 1);
  return compactDate(date.toISOString());
}

/** All-day events with a reminder two days before and one on the day. */
export function buildIcs(items: CalendarItem[], now: Date = new Date()): string {
  const stamp = now.toISOString().replaceAll(/[-:]|\.\d{3}/g, "");
  const events = items.flatMap((item) => {
    if (!item.dueDate) return [];
    return [
      "BEGIN:VEVENT",
      `UID:${item.id}@clearpath`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDate(item.dueDate)}`,
      `DTEND;VALUE=DATE:${nextDay(item.dueDate)}`,
      `SUMMARY:${escapeText(item.title)}`,
      `DESCRIPTION:${escapeText(`${item.description}\n\nIf you miss this: ${item.consequence}`)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-P2D",
      `DESCRIPTION:${escapeText(item.title)}`,
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:PT9H",
      `DESCRIPTION:${escapeText(item.title)}`,
      "END:VALARM",
      "END:VEVENT",
    ];
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClearPath//Deadlines//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ]
    .map(foldLine)
    .join("\r\n");
}
