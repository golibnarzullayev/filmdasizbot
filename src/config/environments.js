import * as dotenv from "dotenv"
dotenv.config()

const {
    BOT_TOKEN,
    DB_URI,
    ERROR_CHANNEL,
    SERVER_URL,
    PORT
} = process.env

export const environments = {
    BOT_TOKEN,
    DB_URI,
    ERROR_CHANNEL,
    SERVER_URL,
    PORT: PORT || 5000
}