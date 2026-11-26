export function toIsoDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date.");
    }
    return date.toISOString();
}
export function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(new Date(value));
}
export function toLocalDateTimeInput(value: string): string {
    const date = new Date(value);
    const pad = (number: number): string =>String(number).padStart(2, "0");
    return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())}T` +
        `${pad(date.getHours())}:` +
        `${pad(date.getMinutes())}`
    );
}