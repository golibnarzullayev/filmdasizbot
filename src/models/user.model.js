import { Schema, model } from "mongoose";

const userSchema = new Schema({
    chatId: { type: Number, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: null },
    username: { type: String, default: null },
    active: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false }
}, { versionKey: false, timestamps: true })

export const UserModel = model('User', userSchema)