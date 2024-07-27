import { Scenes } from "telegraf";
import { MovieModel } from "../../models/movie.model.js";
import { movieAdminKeyboard } from "../../utils/keyboards.js";
import { errorHandler } from "../../helpers/error.handler.js";
export const movieIdScene = new Scenes.BaseScene("movies:id")

movieIdScene.enter(async (ctx) => {
    try {
        const { movieId } = ctx.scene.state

        if (movieId) {
            const movie = await MovieModel.findById(movieId)
            if (movie) {
                await ctx.editMessageText(
                    `<b>Kino nomi: ${movie.title}</b>\n\n`+
                    `<b>Kino kodi: ${movie.code}</b>\n\n`+
                    `<b>Kinoga havola: ${movie.link}</b>`,
                    {...movieAdminKeyboard(movie._id), parse_mode: "HTML" }
                )
            }
        }
    } catch (error) {
        errorHandler(error, ctx)
    }
})

movieIdScene.action(async (callbackData, ctx) => {
    try {
        ctx.answerCbQuery("")
        const [ cursor, data ] = callbackData.split(":")
        
        if (cursor === "remove") {
            const existMovie = await MovieModel.findById(data)
            if (existMovie) {
                await MovieModel.findByIdAndDelete(existMovie._id)
                ctx.scene.enter("movies", { isOld: true })
            }
        } else if (cursor === "back") {
            ctx.scene.enter("movies", { isOld: true })
        }


    } catch (error) {
        errorHandler(error, ctx)
    }
})