import { session } from "telegraf";
import { bot } from "./core/bot.js";
import { authMiddleware } from "./middlewares/auth.js";
import { stage } from "./scenes/index.js";
import { connectDB } from "./config/db.js"
import { isAdmin } from "./middlewares/isAdmin.js";
import { errorHandler } from "./helpers/error.handler.js";

bot.use(session())
bot.use(authMiddleware)
bot.use(stage.middleware())

bot.start(async (ctx) => ctx.scene.enter("start"))
bot.command("admin", isAdmin, async (ctx) => ctx.scene.enter("admin"))

bot.catch((error, ctx) => errorHandler(error, ctx))

export const ready = connectDB()
