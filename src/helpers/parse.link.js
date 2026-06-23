// t.me post havolasini copyMessage uchun { chatId, messageId } ga ajratadi.
// Qo'llab-quvvatlanadi:
//   https://t.me/<username>/<id>        -> { chatId: "@<username>", messageId: <id> }
//   https://t.me/c/<internal>/<id>      -> { chatId: "-100<internal>", messageId: <id> }
// Noto'g'ri bo'lsa null qaytaradi.
export const parsePostLink = (link) => {
    if (!link) return null;

    const privateMatch = link.match(/t\.me\/c\/(\d+)\/(\d+)/);
    if (privateMatch) {
        return {
            chatId: `-100${privateMatch[1]}`,
            messageId: Number(privateMatch[2]),
        };
    }

    const publicMatch = link.match(/t\.me\/([^/]+)\/(\d+)/);
    if (publicMatch) {
        return {
            chatId: `@${publicMatch[1]}`,
            messageId: Number(publicMatch[2]),
        };
    }

    return null;
};
