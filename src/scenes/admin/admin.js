import { Scenes } from "telegraf";
import { adminKeyboard } from "../../utils/keyboards.js";
import { UserModel } from "../../models/user.model.js";
import { ChannelModel } from "../../models/channel.model.js";
import { errorHandler } from "../../helpers/error.handler.js";

export const adminScene = new Scenes.BaseScene("admin");

const CHUNK_SIZE = 25;

// Barcha majburiy kanallarga obuna bo'lgan aktiv foydalanuvchilar sonini hisoblaydi.
// Live Telegram getChatMember orqali tekshiriladi (DB da saqlanmaydi).
const countFullySubscribed = async (ctx) => {
  const channels = await ChannelModel.find().lean();
  if (channels.length === 0) return null;

  const users = await UserModel.find({ active: true }).select("chatId").lean();

  let subscribed = 0;

  for (let i = 0; i < users.length; i += CHUNK_SIZE) {
    const chunk = users.slice(i, i + CHUNK_SIZE);

    const results = await Promise.all(
      chunk.map(async (user) => {
        for (const channel of channels) {
          try {
            const member = await ctx.telegram.getChatMember(
              channel.chatId,
              user.chatId,
            );
            if (member.status === "left" || member.status === "kicked") {
              return false;
            }
          } catch {
            // tekshirib bo'lmadi (bot admin emas / user yo'q) — obuna emas deb hisoblanadi
            return false;
          }
        }
        return true;
      }),
    );

    subscribed += results.filter(Boolean).length;
  }

  return subscribed;
};

adminScene.enter(async (ctx) => {
  await ctx.reply("Admin paneliga xush kelibsiz!", adminKeyboard());
});

adminScene.hears("📊 Statistika", async (ctx) => {
  try {
    const total = await UserModel.estimatedDocumentCount();
    const active = await UserModel.countDocuments({ active: true });
    const inactive = await UserModel.countDocuments({ active: false });

    const waitMessage = await ctx.replyWithHTML(
      `<b>📊 Barcha foydalanuvchilar:</b> ${total} ta\n\n` +
        `<b>🟢 Aktiv bo'lgan:</b> ${active} ta\n\n` +
        `<b>🔴 Aktiv bo'lmagan:</b> ${inactive} ta\n\n` +
        `<i>⏳ Kanal obunalari hisoblanmoqda...</i>`,
    );

    const subscribed = await countFullySubscribed(ctx);

    const subscribedLine =
      subscribed === null
        ? `<b>🔔 Majburiy kanallar:</b> yo'q`
        : `<b>🔔 Barcha kanallarga obuna (aktivlardan):</b> ${subscribed} ta`;

    await ctx.telegram
      .editMessageText(
        ctx.chat.id,
        waitMessage.message_id,
        undefined,
        `<b>📊 Barcha foydalanuvchilar:</b> ${total} ta\n\n` +
          `<b>🟢 Aktiv bo'lgan:</b> ${active} ta\n\n` +
          `<b>🔴 Aktiv bo'lmagan:</b> ${inactive} ta\n\n` +
          subscribedLine,
        { parse_mode: "HTML" },
      )
      .catch(() => {});
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
