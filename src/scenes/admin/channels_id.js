import { Scenes } from "telegraf";
import { ChannelModel } from "../../models/channel.model.js";
import { channelAdminKeyboard } from "../../utils/keyboards.js";
import { errorHandler } from "../../helpers/error.handler.js";

export const channelIdScene = new Scenes.BaseScene("channels:id")

channelIdScene.enter(async (ctx) => {
    try {
        const { channelId } = ctx.scene.state

        if (channelId) {
            const channel = await ChannelModel.findById(channelId)
            if (channel) {
                await ctx.editMessageText(
                    `<b>Kanal nomi: ${channel.title}\n\n`+
                    `Kanal havolasi: ${channel.link}</b>`,
                    { ...channelAdminKeyboard(channel._id), parse_mode: "HTML" }
                )
            }
        }
    } catch (error) {
        errorHandler(error, ctx);
    }
})

channelIdScene.action(async (callbackData, ctx) => {
    try {
        ctx.answerCbQuery("")
        const [ cursor, data ] = callbackData.split(":")

        if (cursor === "remove") {
            const existChannel = await ChannelModel.findById(data)
            if (existChannel) {
                await ChannelModel.findByIdAndDelete(existChannel._id)
                ctx.scene.enter("channels", { isOld: true })
            }
        } else if (cursor === "back") {
            ctx.scene.enter("channels", { isOld: true })
        }
    } catch (error) {
        errorHandler(error, ctx);
    }
})