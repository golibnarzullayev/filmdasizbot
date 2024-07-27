import { TelegramError } from 'telegraf'
import { environments } from '../config/environments.js'
import { bot } from '../core/bot.js'

export const errorHandler = async (error, ctx) => {
    try {
        if (ctx) {
            await ctx.reply("Kechirasiz, xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.")
        }

        const err = error instanceof TelegramError?
        JSON.stringify(error) :
        JSON.stringify(error, Object.getOwnPropertyNames(error))
        
        const errorMessage = 
        `<b>Xatolik! @${bot.botInfo.username}</b>\n\n`+
        `<pre><code class=language-javascript>${err}</code></pre>`

        await bot.telegram.sendMessage(
            environments.ERROR_CHANNEL,
            errorMessage, {
            parse_mode: "HTML"
        });

        console.error(error)
    } catch (error) {
        const errorMessage = `Xatolik! <b>@${bot.botInfo.username}</b>\n\nError handler orqali xatolikni yuborib bo'lmadi`
        
        bot.telegram.sendMessage(
            environments.ERROR_CHANNEL,
            errorMessage, {
            parse_mode: 'HTML'
        })
        console.error(error)
    }
}