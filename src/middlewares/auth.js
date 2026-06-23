import { UserModel } from "../models/user.model.js"
import { nameFormatter } from "../helpers/name.formatter.js"
import { errorHandler } from "../helpers/error.handler.js"

export const authMiddleware = async (ctx, next) => {
    try {
        const chatId = ctx.from?.id
        if (!chatId) return next()

        const existUser = await UserModel.findOne({ chatId })

        if (!existUser) {
            const { first_name, last_name, id, username } = ctx.from ?? {}

            await UserModel.create({
                chatId: id,
                firstName: nameFormatter(first_name) ?? "User",
                lastName: nameFormatter(last_name),
                username
            })
        } else if (!existUser.active) {
            existUser.active = true;
            await existUser.save()
        }
    } catch (error) {
        errorHandler(error, ctx)
    }

    return next()
}