// src/utils/date.ts
const TR_TZ = "Europe/Istanbul";

export function formatTR(value?: string | Date | null): string {
    if (!value) return "-";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "-";

    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: TR_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(d);
}
