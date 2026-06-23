import { bot } from "./core/bot.js"
import { ready } from "./index.js"

async function launch() {
    await ready
    // bot.launch() resolves only when the bot stops; don't await it.
    bot.launch(() => {
        console.log("Bot launched")
    })
}

launch().catch((error) => {
    console.error("Bot launch failed:", error)
    process.exit(1)
})

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))
