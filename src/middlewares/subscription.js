import { errorHandler } from "../helpers/error.handler.js";
import { ChannelModel } from "../models/channel.model.js";
import { subscribingKeyboard } from "../utils/keyboards.js";
import { isAdminUser } from "./isAdmin.js";

const getUnsubscribedChannels = async (ctx, userId) => {
    const channels = await ChannelModel.find();
    const unsubscribedChannels = [];

    for (const channel of channels) {
        try {
            const member = await ctx.telegram.getChatMember(channel.chatId, userId);
            if (member.status === "left" || member.status === "kicked") {
                unsubscribedChannels.push(channel);
            }
        } catch (error) {
            // Bot kanalda admin emas yoki kanal mavjud emas — jim log, userga xabar yuborma.
            console.error(`getChatMember failed for channel ${channel.chatId}:`, error?.message ?? error);
        }
    }

    return unsubscribedChannels;
};

const sendSubscriptionMessage = async (ctx, unsubscribedChannels) => {
    await ctx.replyWithHTML(
        "<b>Botdan foydalanish uchun quyidagi kanallarga obuna bo'ling:</b>\n" +
        "<i>Rahmat</i> (😊)",
        subscribingKeyboard(unsubscribedChannels)
    );
};

const handleSubscriptionConfirmation = async (ctx) => {
    await ctx.answerCbQuery("Rahmat! 😊");
    await ctx.deleteMessage();
    ctx.scene.enter("start");
};

export const subscriptionMiddleware = async (ctx, next) => {
    try {
        const userId = ctx.from.id;

        if (await isAdminUser(userId)) return next();

        const unsubscribedChannels = await getUnsubscribedChannels(ctx, userId);

        if (unsubscribedChannels.length > 0) {
            if (ctx.callbackQuery?.data === "subscribed") {
                await ctx.answerCbQuery("Iltimos, barcha kanallarga obuna bo'ling!");
                return;
            } else if (ctx.callbackQuery) {
                await ctx.answerCbQuery();
            }

            await sendSubscriptionMessage(ctx, unsubscribedChannels);
        } else {
            if (ctx.callbackQuery?.data === "subscribed") {
                await handleSubscriptionConfirmation(ctx);
            }
            return next();
        }
    } catch (error) {
        errorHandler(error, ctx);
    }
};