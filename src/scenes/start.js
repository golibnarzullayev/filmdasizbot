import { Scenes } from "telegraf";
import { MovieModel } from "../models/movie.model.js";
import { bot } from "../core/bot.js";
import { movieKeyboard } from "../utils/keyboards.js";
import { errorHandler } from "../helpers/error.handler.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { nameFormatter } from "../helpers/name.formatter.js";
import { subscriptionMiddleware } from "../middlewares/subscription.js";

export const startScene = new Scenes.BaseScene("start");

startScene.use(subscriptionMiddleware)

startScene.enter(async (ctx) => {
    const userId = ctx.from?.id;
    const firstName = nameFormatter(ctx.from?.first_name);

    await ctx.replyWithHTML(
        `<b>👋 Assalomu alaykum <a href="tg://user?id=${userId}">${firstName}</a> botimizga xush kelibsiz.</b>` +
        `\n\n<i>✍🏻 Kino kodini yuboring.</i>`,
        { reply_markup: { remove_keyboard: true } }
    );
});

startScene.hears( /^\d+$/, async (ctx) => {
    try {
        const code = Number(ctx.message.text);
        const movie = await MovieModel.findOne({ code });
    
        if (!movie) {
            await ctx.replyWithHTML(
                "<b>❌ Bunday kodli kino mavjud emas!</b>"
            );
            return
        }

        movie.count++
    
        await ctx.replyWithDocument(movie.link, {
            caption: `<b>🎬 ${movie.title}</b> | Kod #${movie.code}\n`+
                    `-  -  -  -  -  -  -  -  -\n`+
                    `${movie.description}\n`+
                    `<b>📥 • Yuklandi :</b> ${movie.count}\n\n`+
                    `<b>🔘 @${bot.botInfo?.username}</b>`,
            parse_mode: "HTML",
            ...movieKeyboard(code)
        });

        movie.save()
    } catch (error) {
        await ctx.replyWithHTML("<b>❌ Kinoni yuborishda xatolik</b>")
        errorHandler(error)
    }
});

startScene.action("remove-movie", async (ctx) => {
    try {
        ctx.answerCbQuery("")
        await ctx.deleteMessage(ctx.callbackQuery.inline_message_id)
    } catch (error) {
        errorHandler(error, ctx)
    }
})

startScene.command("admin", isAdmin, (ctx) => ctx.scene.enter("admin"))