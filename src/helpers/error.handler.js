import { TelegramError } from 'telegraf'
import { environments } from '../config/environments.js'
import { bot } from '../core/bot.js'

export const errorHandler = async (error, ctx) => {
    const botUsername = bot.botInfo?.username ?? "bot"

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