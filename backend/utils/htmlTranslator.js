export function HTMLTranslator(html, type = "description") {
    if (!html) return "";

    let cleaned = html
        .replace(/\\u003C/g, "<")
        .replace(/\\u003E/g, ">")
        .replace(/\\u0026/g, "&")

        .replace(/\sclass="[^"]*"/gi, "")
        .replace(/\sstyle="[^"]*"/gi, "")
        .replace(/\sid="[^"]*"/gi, "")

        .replace(/<p>\s*<\/p>/gi, "")

        .replace(/(<br\s*\/?>\s*){2,}/gi, "<br><br>")

        .trim();

    if (type === "description") {
        cleaned = cleaned
            .replace(/<h2[^>]*>/gi, "<h2>")
            .replace(/<p[^>]*>/gi, "<p>");
    }

    if (type === "requirements") {
        cleaned = cleaned
            .replace(/<br\s*\/?>/gi, "")
            .replace(/<ul[^>]*>/gi, "<ul>")
            .replace(/<li[^>]*>/gi, "<li>");
    }

    return cleaned;
}