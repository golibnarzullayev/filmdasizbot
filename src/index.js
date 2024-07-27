import { session } from "telegraf";
import { bot } from "./core/bot.js";
import { authMiddleware } from "./middlewares/auth.js";
import { stage } from "./scenes/index.js";
import { connectDB } from "./config/db.js"
import { isAdmin } from "./middlewares/isAdmin.js";

bot.use(session())
bot.use(stage.middleware())

bot.start(authMiddleware, async (ctx) => ctx.scene.enter("start"))
bot.command("admin", isAdmin, async (ctx) => ctx.scene.enter("admin"))

connectDB()