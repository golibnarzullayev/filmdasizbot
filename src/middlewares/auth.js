import { UserModel } from "../models/user.model.js"
import { nameFormatter } from "../helpers/name.formatter.js"

export const authMiddleware = async (ctx, next) => {
    const chatId = ctx.from?.id
    const existUser = await UserModel.findOne({ chatId })

    if (!existUser) {
        const { first_name, last_name, id, username } = ctx.from?? {}

        await UserModel.create({
            chatId: id,
            firstName: nameFormatter(first_name),
            lastName: nameFormatter(last_name),
            username
        })
    }

    if (existUser && !existUser.active) {
        existUser.active = true;
        await existUser.save()
    }

    next()
}