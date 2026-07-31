export const SHARED_CODES = { "G-001": "G", "R-001": "R", "T-001": "T" };
export const INTERESTS = [
  "Live events", "Karaoke", "KTV / private rooms", "Tasting nights",
  "Art & wine/cocktail events", "Upbeat tea ceremony", "Giveaways & offers",
];

export function normalizeCode(value = "") {
  const compact = value.toUpperCase().replace(/[^GRT0-9]/g, "");
  if (!/^[GRT]001$/.test(compact)) return "";
  return `${compact[0]}-001`;
}

export function normalizeWhatsApp(value = "") {
  const normalized = value.trim().replace(/[\s()-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : "";
}

export function eventCalendarHref() {
  const calendar = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tempo Phuket//Tempo Pass//EN",
    "BEGIN:VEVENT", "UID:tempo-pass-20260822@tempophuket.com", "DTSTAMP:20260731T000000Z",
    "DTSTART;VALUE=DATE:20260822", "DTEND;VALUE=DATE:20260823",
    "SUMMARY:Tempo Ultimate Party Night",
    "DESCRIPTION:Event time to be confirmed. Bring your original Tempo Pass and personal QR. One epic night.",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(calendar)}`;
}

export function csvEscape(value) {
  let text = value == null ? "" : String(value);
  // Stop spreadsheet programs interpreting customer-controlled text as formulae.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[\",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
