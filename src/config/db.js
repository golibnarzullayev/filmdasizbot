import mongoose from "mongoose"
import { environments } from "./environments.js"
import { errorHandler } from "../helpers/error.handler.js"

export const connectDB = async () => {
    try {
        await mongoose.connect(environments.DB_URI)
        console.log("DB connected successfully")
    } catch (error) {
        errorHandler(error)
    }
}