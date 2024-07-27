import { Scenes } from "telegraf";
import { channelsAdminKeyboard } from "../../utils/keyboards.js";
import { ChannelModel } from "../../models/channel.model.js";
import { errorHandler } from "../../helpers/error.handler.js";

export const channelsScene = new Scenes.BaseScene("channels")

channelsScene.enter(async (ctx) => {
    try {
        const channels = await ChannelModel.find()
        
        const { isOld } = ctx.scene.state
        if (isOld) {
            await ctx.editMessageText(
                "<b>Kanallar ro'yxati:</b>",
                { ...channelsAdminKeyboard(channels), parse_mode: "HTML" }
            )
        } else {
            await ctx.reply("🔔 Majburiy obuna", { reply_markup: { remove_keyboard: true } })
            await ctx.replyWithHTML(
                "<b>Kanallar ro'yxati:</b>",
                channelsAdminKeyboard(channels)
            )
        }
    } catch (error) {
        errorHandler(error, ctx);
    }
})

channelsScene.action(async (callbackData, ctx) => {
    try {
        ctx.answerCbQuery("")
        const [ cursor, data ] = callbackData.split(":")

        if (cursor === "admin-channels") {
            if (data === "back") {
                ctx.editMessageReplyMarkup({})
                ctx.scene.enter("admin")
            } else if (data === "add") {
                ctx.scene.enter("channels:add")
            }
        } else if (cursor === "channel") {
            const existChannel = await ChannelModel.findById(data)

            if (existChannel) {
                ctx.scene.enter("channels:id", { channelId: data })
            }
        }
    } catch (error) {
        errorHandler(error, ctx);
    }
})