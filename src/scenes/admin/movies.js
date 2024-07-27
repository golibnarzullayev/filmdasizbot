import { Scenes } from "telegraf";
import { moviesAdminKeyboard } from "../../utils/keyboards.js";
import { MovieModel } from "../../models/movie.model.js";
import { errorHandler } from "../../helpers/error.handler.js";

export const moviesScene = new Scenes.BaseScene("movies")

moviesScene.enter(async (ctx) => {
    try {
        const movies = await MovieModel.find()
        
        const { isOld } = ctx.scene.state
        if (isOld) {
            await ctx.editMessageText(
                "<b>Mavjud kinolar:</b>",
                { ...moviesAdminKeyboard(movies), parse_mode: "HTML" }
            )
        } else {
            await ctx.reply("🎬 Kinolar", { reply_markup: { remove_keyboard: true } })
            await ctx.replyWithHTML(
                "<b>Mavjud kinolar:</b>",
                moviesAdminKeyboard(movies)
            )
        }
    } catch (error) {
        errorHandler(error, ctx)
    }
})

moviesScene.action(async (callbackData, ctx) => {
    try {
        ctx.answerCbQuery("")
        const [ cursor, data ] = callbackData.split(":")

        if (cursor === "admin-movies") {
            if (data === "back") {
                ctx.editMessageReplyMarkup({})
                ctx.scene.enter("admin")
            } else if (data === "add") {
                ctx.scene.enter("movies:add")
            }
        } else if (cursor === "movie") {
            const existMovie = await MovieModel.findById(data)

            if (existMovie) {
                ctx.scene.enter("movies:id", { movieId: data })
            }
        }
    } catch (error) {
        errorHandler(error, ctx)
    }
})