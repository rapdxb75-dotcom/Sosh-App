export const formatNumber = (num: number): string => {
    if (!num) return "0";
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
};

export const getTimestampWithTimezone = (): string => {
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const diff = offset >= 0 ? "+" : "-";
    const pad = (num: number) => String(num).padStart(2, "0");
    return (
        now.getFullYear() +
        "-" +
        pad(now.getMonth() + 1) +
        "-" +
        pad(now.getDate()) +
        "T" +
        pad(now.getHours()) +
        ":" +
        pad(now.getMinutes()) +
        ":" +
        pad(now.getSeconds()) +
        diff +
        pad(Math.floor(Math.abs(offset) / 60)) +
        ":" +
        pad(Math.abs(offset) % 60)
    );
};
