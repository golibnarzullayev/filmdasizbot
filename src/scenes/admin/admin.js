import { Scenes } from "telegraf";
import { adminKeyboard } from "../../utils/keyboards.js";
import { UserModel } from "../../models/user.model.js";
import { bot } from "../../core/bot.js";
import { errorHandler } from "../../helpers/error.handler.js";

export const adminScene = new Scenes.BaseScene("admin");

adminScene.enter(async (ctx) => {
  await ctx.reply("Admin paneliga xush kelibsiz!", adminKeyboard());
});

adminScene.hears("📊 Statistika", async (ctx) => {
  try {
    const total = await UserModel.estimatedDocumentCount();
    const active = await UserModel.countDocuments({ active: true });
    const inactive = await UserModel.countDocuments({ active: false });

    const count = {
      total: total,
      active: active,
      inactive: inactive,
    };

    await ctx.replyWithHTML(
      `<b>📊 Barcha foydalanuvchilar:</b> ${count.total} ta\n\n` +
        `<b>🟢 Aktiv bo'lgan:</b> ${count.active} ta\n\n` +
        `<b>🔴 Aktiv bo'lmagan:</b> ${count.inactive} ta`,
    );
  } catch (error) {
    errorHandler(error, ctx);
  }
});

adminScene.hears("📨 Yangi xabar", async (ctx) =>
  ctx.scene.enter("send-message"),
);
adminScene.hears("🎬 Kinolar", async (ctx) => ctx.scene.enter("movies"));
adminScene.hears("🔔 Majburiy obuna", async (ctx) =>
  ctx.scene.enter("channels"),
);

adminScene.hears("⬅️ Chiqish", async (ctx) => ctx.scene.enter("start"));
