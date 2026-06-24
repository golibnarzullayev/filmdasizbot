import { TelegramError } from 'telegraf'
import { environments } from '../config/environments.js'
import { bot } from '../core/bot.js'

// Foydalanuvchi tomonidan keladigan, hech narsa qila olmaydigan xatoliklar — error kanaliga yuborilmaydi.
const isIgnorableTelegramError = (error) => {
    if (!(error instanceof TelegramError) || error.code !== 403) return false
    const desc = error.description ?? ""
    return (
        desc.includes("bot was blocked by the user") ||
        desc.includes("user is deactivated") ||
        desc.includes("bot can't initiate conversation") ||
        desc.includes("chat not found")
    )
}

export const errorHandler = async (error, ctx) => {
    const botUsername = bot.botInfo?.username ?? "bot"

    if (isIgnorableTelegramError(error)) {
        console.warn(`Ignorable Telegram error (${error.code}): ${error.description}`)
        return
    }

    try {
        if (ctx) {
            await ctx.reply("Kechirasiz, xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.").catch(() => {})
        }

        const err = error instanceof TelegramError?
        JSON.stringify(error) :
        JSON.stringify(error, Object.getOwnPropertyNames(error))

        const errorMessage =
        `<b>Xatolik! @${botUsername}</b>\n\n`+
        `<pre><code class=language-javascript>${err}</code></pre>`

        await bot.telegram.sendMessage(
            environments.ERROR_CHANNEL,
            errorMessage, {
            parse_mode: "HTML"
        });

        console.error(error)
    } catch (innerError) {
        const errorMessage = `Xatolik! <b>@${botUsername}</b>\n\nError handler orqali xatolikni yuborib bo'lmadi`

        await bot.telegram.sendMessage(
            environments.ERROR_CHANNEL,
            errorMessage, {
            parse_mode: 'HTML'
        }).catch(() => {})
        console.error(innerError)
    }
}