import { Schema, model } from "mongoose";

const movieSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: Number, required: true },
    link: { type: String, required: true },
    count: { type: Number, required: true, default: 0 }
}, { versionKey: false, timestamps: true })

export const MovieModel = model('Movie', movieSchema)