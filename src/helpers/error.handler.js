import { TelegramError } from 'telegraf'
import { environments } from '../config/environments.js'
import { bot } from '../core/bot.js'
import { UserModel } from '../models/user.model.js'

// Foydalanuvchi bot bilan aloqani uzgan — qayta urinish foyda bermaydi, userni inactive qilamiz.
const isUserUnreachableError = (error) => {
    if (!(error instanceof TelegramError) || error.code !== 403) return false
    const desc = error.description ?? ""
    return (
        desc.includes("bot was blocked by the user") ||
        desc.includes("user is deactivated") ||
        desc.includes("bot can't initiate conversation") ||
        desc.includes("chat not found")
    )
}

// Userni inactive qilib belgilaymiz — keyingi rassilkalarda o'tkazib yuboriladi.
// User qaytib kelganda authMiddleware uni yana active qiladi.
const deactivateUser = async (chatId) => {
    if (!chatId) return
    await UserModel.updateOne({ chatId }, { active: false })
        .catch((err) => console.error(`Userni (${chatId}) inactive qilishda xato:`, err?.message ?? err))
}

export const errorHandler = async (error, ctx) => {
    const botUsername = bot.botInfo?.username ?? "bot"

    if (isUserUnreachableError(error)) {
        console.warn(`User unreachable (${error.code}): ${error.description}`)
        await deactivateUser(ctx?.from?.id)
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