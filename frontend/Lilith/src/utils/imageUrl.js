export function getImageUrl(path) {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    return `${import.meta.env.VITE_BACKEND_URL}${path}`;
}
