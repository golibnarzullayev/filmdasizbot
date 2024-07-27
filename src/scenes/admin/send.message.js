import { Markup, Scenes } from "telegraf";
import {
  adminKeyboard,
  backKeyboard,
  sendOrCanelKeyboard,
} from "../../utils/keyboards.js";
import { UserModel } from "../../models/user.model.js";

export const sendMessageScene = new Scenes.WizardScene(
  "send-message",
  async (ctx) => {
    const text =
      "🪴 Bu bo'lim orqali siz foydalanuvchilarga xabarlar jo'nata olasz!";

    const keyboard = Markup.keyboard([["◀️ Ortga"]]).resize();

    await ctx.reply(text, keyboard);

    await ctx.reply("Reklama xabarini yuboring!");

    ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.isForward = !!ctx.update["message"]["forward_from"];
    ctx.session.lastMessageId = ctx.message.message_id;

    const keyboard = Markup.inlineKeyboard([
      { text: "✅ Jo'natish", callback_data: "send_message" },
    ]);

    await ctx.reply("✅ Xabarni yuborishni tasdiqlaysizmi?", keyboard);
  },
);

sendMessageScene.action(/send_message/g, async (ctx) => {
  await ctx.answerCbQuery();

  const chatId = ctx.callbackQuery?.message?.chat?.id;
  const lastMessageId = ctx?.["session"]?.["lastMessageId"];
  const isForward = ctx?.["session"]?.["isForward"];

  if (lastMessageId && chatId) {
    const chunkSize = 30;
    let currentIndex = 0;

    let count = 0;
    const users = await UserModel.find({ active: true }).lean();
    const total = users.length;

    while (currentIndex < total) {
      const promises = [];

      for (let i = currentIndex; i <= currentIndex + chunkSize; i++) {
        const user = users[i];

        try {
          let promise;

          if (!isForward) {
            promise = ctx.telegram.copyMessage(
              user.chatId,
              chatId,
              lastMessageId,
            );
          } else {
            promise = ctx.telegram.forwardMessage(
              user.chatId,
              chatId,
              lastMessageId,
            );
          }

          promises.push(promise);

          count = count + 1;
        } catch (error) {
          if (user) {
            await UserModel.updateOne(
              { _id: user._id.toString() },
              {
                isActive: false,
              },
            );
          }
        }
      }

      await Promise.all(promises);
      currentIndex += chunkSize;
    }

    return ctx.reply(
      `Reklama *${total}* foydalanuvchidan *${count}* foydalanuvchiga yetkazildi!`,
      {
        parse_mode: "Markdown",
      },
    );
  }
});

sendMessageScene.hears("◀️ Ortga", (ctx) => ctx.scene.enter("admin"));
