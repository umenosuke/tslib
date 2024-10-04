export { date2Format as date2FormatDate };

function date2Format(date: Date, format = "YYYY-MM-DD hh:mm:ss"): string {
    return format
        .replace("YYYY", String(date.getFullYear()).padStart(4, "0"))
        .replace("MM", String(date.getMonth() + 1).padStart(2, "0"))
        .replace("DD", String(date.getDate()).padStart(2, "0"))
        .replace("hh", String(date.getHours()).padStart(2, "0"))
        .replace("mm", String(date.getMinutes()).padStart(2, "0"))
        .replace("ss", String(date.getSeconds()).padStart(2, "0"));
}
