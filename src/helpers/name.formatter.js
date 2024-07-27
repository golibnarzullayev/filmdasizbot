export const nameFormatter = (text) => {
    if (text) {
        return text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }
    return null
}