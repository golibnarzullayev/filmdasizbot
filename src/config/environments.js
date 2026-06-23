import * as dotenv from "dotenv"
dotenv.config()

const {
    BOT_TOKEN,
    DB_URI,
    ERROR_CHANNEL,
    SERVER_URL,
    PORT,
    ADMIN_IDS
} = process.env

export const environments = {
    BOT_TOKEN,
    DB_URI,
    ERROR_CHANNEL,
    SERVER_URL,
    PORT: PORT || 5000,
    ADMIN_IDS: (ADMIN_IDS || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .map(Number)
}