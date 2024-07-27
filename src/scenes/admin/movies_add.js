import { Scenes } from "telegraf";
import {
    approveKeyboard,
    backInlineKeyboard,
    cancelOrBackInlineKeyboard,
    moviesAdminKeyboard
} from "../../utils/keyboards.js";

import { MovieModel } from "../../models/movie.model.js";

export const moviesAddScene = new Scenes.WizardScene("movies:add",
    // Get title and request description
    async (ctx) => {
        try {
            if (ctx.has("callback_query")) {
                ctx.answerCbQuery("");
                const callbackData = ctx.callbackQuery.data;
                const [cursor, data] = callbackData.split(":");

                if (+cursor === ctx.wizard.cursor && data === "back") {
                    const movies = await MovieModel.find();
                    await ctx.editMessageText(
                        "Kinolar ro'yxati", 
                        { ...moviesAdminKeyboard(movies) }
                    );
                    return ctx.scene.enter("movies", {}, true);
                }
            }

            if (ctx.message?.text) {
                const movieTitle = ctx.message.text;
                ctx.session.movie = { title: movieTitle };

                await ctx.reply(
                    "Yaxshi. Endi esa kino uchun tavsif yuboring:",
                    cancelOrBackInlineKeyboard(ctx.wizard.cursor + 1)
                );
                return ctx.wizard.next();
            }
        } catch (error) {
            ;
        }
    },
    // Get description and request code
    async (ctx) => {
        try {
            if (ctx.has("callback_query")) {
                ctx.answerCbQuery("");
                const callbackData = ctx.callbackQuery.data;
                const [cursor, data] = callbackData.split(":");

                if (+cursor === ctx.wizard.cursor) {
                    if (data === "back") {
                        await ctx.editMessageText(
                            "Kino nomini kiriting:",
                            { ...backInlineKeyboard(ctx.wizard.cursor - 1) }
                        );
                        return ctx.wizard.back();
                    } else if (data === "cancel") {
                        await ctx.editMessageReplyMarkup({});
                        delete ctx.session.movie;
                        return ctx.scene.enter("movies");
                    }
                }
            }

            if (ctx.message?.text) {
                ctx.session.movie.description = ctx.message.text;

                await ctx.reply(
                    "Kino kodini yuboring:",
                    cancelOrBackInlineKeyboard(ctx.wizard.cursor + 1)
                );
                return ctx.wizard.next();
            }
        } catch (error) {
            ;
        }
    },
    // Get code and request link
    async (ctx) => {
        try {
            if (ctx.has("callback_query")) {
                ctx.answerCbQuery("");
                const callbackData = ctx.callbackQuery.data;
                const [cursor, data] = callbackData.split(":");

                if (+cursor === ctx.wizard.cursor) {
                    if (data === "back") {
                        await ctx.editMessageText(
                            "Kino uchun tavsif yuboring:",
                            { ...cancelOrBackInlineKeyboard(ctx.wizard.cursor - 1) }
                        );
                        return ctx.wizard.back();
                    } else if (data === "cancel") {
                        await ctx.editMessageReplyMarkup({});
                        delete ctx.session.movie;
                        return ctx.scene.enter("movies");
                    }
                }
            }

            if (ctx.message?.text) {
                const movieCode = ctx.message.text;
                const isValidCode = /^\d+$/.test(movieCode);
                if (!isValidCode) {
                    await ctx.reply(
                        "Kino kodi faqat 0-9 raqamlaridan iborat bo'lishi kerak. Iltimos, qaytadan kiriting:",
                        cancelOrBackInlineKeyboard(ctx.wizard.cursor)
                    );
                    return;
                }
                
                ctx.session.movie.code = ctx.message.text;

                await ctx.replyWithHTML(
                    "Kino havolasini yuboring (ommaviy telegram kanaldagi postga link bo'lsin). <b>Bot kanalda admin sifatida qo'shilgan bo'lishi shart!</b>",
                    cancelOrBackInlineKeyboard(ctx.wizard.cursor + 1)
                );
                return ctx.wizard.next();
            }
        } catch (error) {
            ;
        }
    },
    // Get link and request approve or cancel
    async (ctx) => {
        try {
            if (ctx.has("callback_query")) {
                ctx.answerCbQuery("");
                const callbackData = ctx.callbackQuery.data;
                const [cursor, data] = callbackData.split(":");

                if (+cursor === ctx.wizard.cursor) {
                    if (data === "back") {
                        await ctx.editMessageText(
                            "Kino kodini yuboring:", {
                                ...cancelOrBackInlineKeyboard(ctx.wizard.cursor - 1)
                            }
                        );
                        return ctx.wizard.back();
                    } else if (data === "cancel") {
                        await ctx.editMessageReplyMarkup({});
                        delete ctx.session.movie;
                        return ctx.scene.enter("movies");
                    }
                }
            }

            if (ctx.message?.text) {
                const movieLink = ctx.message.text;
                const isLinkValid = /https:\/\/t\.me\/.+/.test(movieLink);

                if (!isLinkValid) {
                    await ctx.reply(
                        "Kino havolasi noto'g'ri. Iltimos, qaytadan kiriting:",
                        cancelOrBackInlineKeyboard(ctx.wizard.cursor)
                    );
                    return;
                }
                
                const channelIdMatch = movieLink.match(/t\.me\/(.*?)\/(\d+)/);
                const channelUsername = channelIdMatch ? channelIdMatch[1] : null;

                const channelInfo = await ctx.telegram.getChatAdministrators(`@${channelUsername}`).catch(() => false);
                if (!channelInfo) {
                    await ctx.replyWithHTML(
                        "Kanal yoki post mavjud emas, <b>kanal va post ommaviy bo'lishi kerak!</b> Yoki bot kanalda admin emas! Iltimos, qaytadan urinib ko'ring:"
                    );
                    return;
                }

                ctx.session.movie.link = movieLink;

                try {
                    await ctx.replyWithDocument(movieLink, {
                        caption: `<b>Kino nomi:</b> ${ctx.session.movie.title}\n\n`+
                        `<b>Kino tavsifi:</b> ${ctx.session.movie.description}\n\n`+
                        `<b>Kino kodi:</b> ${ctx.session.movie.code}\n\n`+
                        `<b>Kinoga havola:</b> ${movieLink}`,
                        parse_mode: "HTML",
                        ...approveKeyboard(ctx.session.movie.code)
                    });
                } catch (error) {
                    await ctx.reply(
                        "Ma'lumotlarni qayta ishlashda qandaydir muammo yuz berdi. Iltimos qayta urinib ko'ring!",
                        cancelOrBackInlineKeyboard(ctx.wizard.cursor)
                    )
                    return
                }
                return ctx.wizard.next();
            }
        } catch (error) {
            ;
        }
    },
    // If get approve save movie, else cancel all
    async (ctx) => {
        try {
            if (ctx.has("callback_query")) {
                ctx.answerCbQuery("");
                const callbackData = ctx.callbackQuery.data;
                const [cursor, data] = callbackData.split(":");

                if (data === ctx.session.movie.code) {
                    if (cursor === "approve") {
                        const {
                            title,
                            description,
                            code,
                            link
                        } = ctx.session.movie;

                        await MovieModel.create({
                            title,
                            description,
                            code,
                            link
                        });
                        await ctx.reply("Kino muvaffaqiyatli qo'shildi ✅");
                    } else if (data === "cancel") {
                        await ctx.editMessageReplyMarkup({});
                    }
                    delete ctx.session.movie;
                    return ctx.scene.enter("movies");
                }
            }
        } catch (error) {
            ;
        }
    }
);

moviesAddScene.enter(async (ctx) => {
    try {
        await ctx.editMessageText(
            "Kino nomini kiriting:", {
                ...backInlineKeyboard(0)
            }
        );
    } catch (error) {
        ;
    }
});