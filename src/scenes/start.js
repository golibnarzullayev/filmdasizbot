import { Scenes } from "telegraf";
import { MovieModel } from "../models/movie.model.js";
import { bot } from "../core/bot.js";
import { movieKeyboard } from "../utils/keyboards.js";
import { errorHandler } from "../helpers/error.handler.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { nameFormatter } from "../helpers/name.formatter.js";
import { subscriptionMiddleware } from "../middlewares/subscription.js";
import { parsePostLink } from "../helpers/parse.link.js";

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

        const post = parsePostLink(movie.link);
        if (!post) {
            await ctx.replyWithHTML("<b>❌ Kino havolasi noto'g'ri saqlangan!</b>");
            return
        }

        await ctx.telegram.copyMessage(ctx.chat.id, post.chatId, post.messageId, {
            caption: `<b>🎬 ${movie.title}</b> | Kod #${movie.code}\n`+
                    `-  -  -  -  -  -  -  -  -\n`+
                    `${movie.description}\n`+
                    `<b>📥 • Yuklandi :</b> ${movie.count + 1}\n\n`+
                    `<b>🔘 @${bot.botInfo?.username}</b>`,
            parse_mode: "HTML",
            ...movieKeyboard(code)
        });

        await MovieModel.updateOne({ _id: movie._id }, { $inc: { count: 1 } })
    } catch (error) {
        await ctx.replyWithHTML("<b>❌ Kinoni yuborishda xatolik</b>")
        errorHandler(error)
    }
});

startScene.action("remove-movie", async (ctx) => {
    try {
        await ctx.answerCbQuery("")
        await ctx.deleteMessage()
    } catch (error) {
        errorHandler(error, ctx)
    }
})

startScene.command("admin", isAdmin, (ctx) => ctx.scene.enter("admin"))