import { errorHandler } from "../helpers/error.handler.js"
import { UserModel } from "../models/user.model.js"

export const isAdmin = async (ctx, next) => {
    try {
        const user = await UserModel.findOne({ chatId: ctx.from?.id })

        if (user && user.isAdmin) {
            return next()
        }
        await ctx.replyWithHTML(`<b>${ctx.from?.id}</b>`)
    } catch (error) {
        errorHandler(error, ctx)
    }
}