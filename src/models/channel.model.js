import { Schema, model } from "mongoose";

const channelSchema = new Schema({
    title: { type: String, required: true },
    chatId: { type: String, required: true },
    link: { type: String, required: true }
})

export const ChannelModel = model('Channel', channelSchema)