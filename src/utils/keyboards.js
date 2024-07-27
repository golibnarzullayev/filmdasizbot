import { Markup } from "telegraf";

export const movieKeyboard = (movieCode) => {
    return Markup.inlineKeyboard([
        [ Markup.button.switchToChat("♻️ Do'stlarga ulashish", `- botdan foydalaning va ${movieCode} kodli kinoni bepul yuklab oling 😉`) ],
        [ Markup.button.callback("❌ O'chirish", "remove-movie") ]
    ]).resize()
}

export const subscribingKeyboard = (channels) => {
    const keyboards = []

    channels.forEach((channel, index) => {
        keyboards.push([Markup.button.url(`${index + 1}-kanal`, channel.link)])
    })
    keyboards.push([Markup.button.callback("✅ Tasdiqlash", "subscribed")])

    return Markup.inlineKeyboard(keyboards)
}

export const approveKeyboard = (movieCode) => Markup.inlineKeyboard([
    [ Markup.button.callback("✅ Tasdiqlash", `approve:${movieCode}`) ],
    [ Markup.button.callback("🚫 Bekor qilish", `cancel:${movieCode}`) ]
])

export const adminKeyboard = () => Markup.keyboard([
    [ Markup.button.text("🎬 Kinolar"), Markup.button.text("🔔 Majburiy obuna") ],
    [ Markup.button.text("📨 Yangi xabar"), Markup.button.text("📊 Statistika") ],
    [ Markup.button.text("⬅️ Chiqish") ]
]).resize()

export const backKeyboard = () => Markup.keyboard([
    Markup.button.text("◀️ Ortga")
]).resize()

export const backInlineKeyboard = (cursor) => Markup.inlineKeyboard([
    Markup.button.callback("⬅️ Ortga qaytish", `${cursor}:back`)
])

export const cancelInlineKeyboard = (cursor) => Markup.inlineKeyboard([
    Markup.button.callback("🚫 Bekor qilish", `${cursor}:cancel`)
])

export const cancelOrBackInlineKeyboard = (cursor) => Markup.inlineKeyboard([
    [ Markup.button.callback("🚫 Bekor qilish", `${cursor}:cancel`) ],
    [ Markup.button.callback("⬅️ Ortga qaytish", `${cursor}:back`) ]
])

export const moviesAdminKeyboard = (movies) => {
    const keyboards = [[]]

    if (movies.length > 0) {
        movies.forEach((movie) => {
            const lastItem = keyboards[ keyboards.length - 1 ]

            if (lastItem.length < 2) {
                lastItem.push(Markup.button.callback(movie.title, `movie:${movie._id}`))
            } else {
                keyboards.push([ Markup.button.callback(movie.title, `movie:${movie._id}`)])
            }
        })
    }

    keyboards.push([Markup.button.callback("↖️ Kino qo'shish", "admin-movies:add")])
    keyboards.push(backInlineKeyboard("admin-movies").reply_markup.inline_keyboard[0])

    return Markup.inlineKeyboard(keyboards)
}

export const movieAdminKeyboard = (movieId) => Markup.inlineKeyboard([
    [ Markup.button.callback("🚫 Olib tashlash", `remove:${movieId}`) ],
    [ Markup.button.callback("⬅️ Ortga qaytish", `back:${movieId}`) ]
])

export const channelsAdminKeyboard = (channels) => {
    const keyboards = [[]]

    if (channels.length > 0) {
        channels.forEach((channel) => {
            const lastItem = keyboards[ keyboards.length - 1 ]

            if (lastItem.length < 2) {
                lastItem.push(Markup.button.callback(channel.title, `channel:${channel._id}`))
            } else {
                keyboards.push([ Markup.button.callback(channel.title, `channel:${channel._id}`)])
            }
        })
    }

    keyboards.push([Markup.button.callback("↖️ Kanal qo'shish", "admin-channels:add")])
    keyboards.push(backInlineKeyboard("admin-channels").reply_markup.inline_keyboard[0])

    return Markup.inlineKeyboard(keyboards)
}

export const channelAdminKeyboard = (channelId) => Markup.inlineKeyboard([
    [ Markup.button.callback("🚫 Olib tashlash", `remove:${channelId}`) ],
    [ Markup.button.callback("⬅️ Ortga qaytish", `back:${channelId}`) ]
])

export const sendOrCanelKeyboard = () => Markup.inlineKeyboard([
    Markup.button.callback("🚫 Bekor qilish", "cancel"),
    Markup.button.callback("✅ Yuborish", "send-text")
])

