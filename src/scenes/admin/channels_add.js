import { Scenes } from "telegraf";
import { backInlineKeyboard, cancelOrBackInlineKeyboard, channelsAdminKeyboard } from "../../utils/keyboards.js";
import { ChannelModel } from "../../models/channel.model.js";
import { errorHandler } from "../../helpers/error.handler.js";

export const channelsAddScene = new Scenes.WizardScene("channels:add",
    // Get title and request link
    async (ctx) => {
        try {
            if (ctx.has("callback_query")) {
                ctx.answerCbQuery("");
                const callbackData = ctx.callbackQuery.data;
                const [cursor, data] = callbackData.split(":");
                
                if (+cursor === ctx.wizard.cursor && data === "back") {
                    const channels = await ChannelModel.find()
                    await ctx.editMessageText(
                        "<b>Kanallar ro'yxati</b>",
                        { ...channelsAdminKeyboard(channels), parse_mode: "HTML" }
                    );
                    return ctx.scene.enter("channels", {}, true);
                }
            }

            if (ctx.message?.text) {
                const channelTitle = ctx.message.text;
                ctx.session.channel = { title: channelTitle };

                await ctx.replyWithHTML(
                    "Yaxshi. Endi esa kanal havolasini yuboring. <b>Bot kanalda admin sifatida qo'shilgan bo'lishi shart!</b>",
                    cancelOrBackInlineKeyboard(ctx.wizard.cursor + 1)
                );
                return ctx.wizard.next();
            }
        } catch (error) {
            errorHandler(error, ctx);
        }
    },
    // Get link and request chatID
    async (ctx) => {
        try {
            if (ctx.has("callback_query")) {
                ctx.answerCbQuery("");
                const callbackData = ctx.callbackQuery.data;
                const [cursor, data] = callbackData.split(":");

                if (+cursor === ctx.wizard.cursor) {
                    if (data === "back") {
                        await ctx.editMessageText(
                            "Kanal nomini kiriting:",
                            { ...backInlineKeyboard(ctx.wizard.cursor - 1) }
                        );
                        return ctx.wizard.back();
                    } else if (data === "cancel") {
                        await ctx.editMessageReplyMarkup({});
                        delete ctx.session.channel;
                        return ctx.scene.enter("channels");
                    }
                }
            }

            if (ctx.message?.text) {
                const channelLink = ctx.message.text;
                const isLinkValid = /https:\/\/t\.me\/(.+)/.test(channelLink);
            
                if (!isLinkValid) {
                    await ctx.reply(
                        "Kanal havolasi noto'g'ri. Iltimos, qaytadan kiriting:",
                        cancelOrBackInlineKeyboard(ctx.wizard.cursor)
                    );
                    return;
                }
                
                ctx.session.channel.link = channelLink

                await ctx.replyWithHTML(
                    "Yuqoridagi kanal ID sini yuboring. <b>Bot kanalda admin sifatida qo'shilgan bo'lishi shart!</b>",
                    cancelOrBackInlineKeyboard(ctx.wizard.cursor + 1)
                );
                return ctx.wizard.next()
            }
        } catch (error) {
            errorHandler(error, ctx);
        }

    },
    // Get chatId and SAVE
    async (ctx) => {
        try {
            if (ctx.has("callback_query")) {
                ctx.answerCbQuery("");
                const callbackData = ctx.callbackQuery.data;
                const [cursor, data] = callbackData.split(":");

                if (+cursor === ctx.wizard.cursor) {
                    if (data === "back") {
                        await ctx.editMessageText(
                            "Kanal havolasini yuboring. <b>Bot kanalda admin sifatida qo'shilgan bo'lishi shart!</b>", {
                                ...backInlineKeyboard(ctx.wizard.cursor - 1),
                                parse_mode: "HTML"
                            }
                        );
                        return ctx.wizard.back();
                    } else if (data === "cancel") {
                        await ctx.editMessageReplyMarkup({});
                        delete ctx.session.channel;
                        return ctx.scene.enter("channels");
                    }
                }
            }

            if (ctx.message?.text) {
                const channelId = ctx.message.text
                const isValidId = /^-\d+$/.test(channelId)

                if (!isValidId) {
                    await ctx.replyWithHTML(
                        "Kanal ID si noto'g'ri formatda kiritildi. <b>To'g'ri format: -100192549804</b>",
                        cancelOrBackInlineKeyboard(ctx.wizard.cursor)
                    );
                    return;
                }

                const channelInfo = await ctx.telegram.getChatAdministrators(channelId).catch(() => false)
                if (!channelInfo) {
                    await ctx.replyWithHTML(
                        "Kanal mavjud emas yoki bot kanalda admin emas. Iltimos botni kanalga admin sifatida qo'shib, qaytadan urinib ko'ring:",
                        cancelOrBackInlineKeyboard(ctx.wizard.cursor)
                    )
                    return
                }

                const { title, link } = ctx.session.channel

                await ChannelModel.create({
                    title,
                    link,
                    chatId: channelId
                })

                delete ctx.session.channel
                await ctx.reply("Kanal muvaffaqiyatli qo'shildi ✅")
                ctx.scene.enter("channels")
            }
        } catch (error) {
            errorHandler(error, ctx);
        }

    }
);

channelsAddScene.enter(async (ctx) => {
    try {
        await ctx.editMessageText(
            "Kanal nomini kiriting:",
            { ...backInlineKeyboard(0) }
        );
    } catch (error) {
        errorHandler(error, ctx);
    }
});