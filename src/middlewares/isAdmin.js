import { errorHandler } from "../helpers/error.handler.js"
import { UserModel } from "../models/user.model.js"
import { environments } from "../config/environments.js"

export const isAdminUser = async (userId) => {
    if (environments.ADMIN_IDS.includes(Number(userId))) {
        return true
    }
    return Boolean(await UserModel.exists({ chatId: userId, isAdmin: true }))
}

export const isAdmin = async (ctx, next) => {
    try {
        if (await isAdminUser(ctx.from?.id)) {
            return next()
        }
        await ctx.replyWithHTML("<b>Sizda ruxsat yo'q.</b>")
    } catch (error) {
        errorHandler(error, ctx)
    }
}
