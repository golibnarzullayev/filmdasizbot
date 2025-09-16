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
    try {
      const text =
        "🪴 Bu bo'lim orqali siz foydalanuvchilarga xabarlar jo'nata olasz!";

      const keyboard = Markup.keyboard([["◀️ Ortga"]]).resize();

      await ctx.reply(text, keyboard);
      await ctx.reply("Reklama xabarini yuboring!");
      ctx.wizard.next();
    } catch (err) {
      console.error("Scene step 1 error:", err);
      await ctx.reply("Xatolik yuz berdi, qaytadan urinib ko‘ring.");
      return ctx.scene.enter("admin");
    }
  },
  async (ctx) => {
    try {
      ctx.session.isForward = !!ctx.update?.message?.forward_from;
      ctx.session.lastMessageId = ctx.message?.message_id;

      const keyboard = Markup.inlineKeyboard([
        { text: "✅ Jo'natish", callback_data: "send_message" },
      ]);

      await ctx.reply("✅ Xabarni yuborishni tasdiqlaysizmi?", keyboard);
    } catch (err) {
      console.error("Scene step 2 error:", err);
      await ctx.reply("Xatolik yuz berdi.");
      return ctx.scene.enter("admin");
    }
  }
);

sendMessageScene.action(/send_message/g, async (ctx) => {
  try {
    await ctx.answerCbQuery().catch(() => {});

    const chatId = ctx.callbackQuery?.message?.chat?.id;
    const lastMessageId = ctx?.session?.lastMessageId;
    const isForward = ctx?.session?.isForward;

    if (!lastMessageId || !chatId) {
      await ctx.reply("Xabar topilmadi.");
      return;
    }

    const chunkSize = 30;
    let currentIndex = 0;
    let count = 0;

    let users = [];
    try {
      users = await UserModel.find({ active: true }).lean();
    } catch (err) {
      console.error("Userlarni olishda xato:", err);
      return ctx.reply("Foydalanuvchilarni olishda muammo bo‘ldi.");
    }

    const total = users.length;

    while (currentIndex < total) {
      const promises = [];

      for (
        let i = currentIndex;
        i < currentIndex + chunkSize && i < total;
        i++
      ) {
        const user = users[i];
        if (!user) continue;

        try {
          let promise;
          if (!isForward) {
            promise = ctx.telegram.copyMessage(
              user.chatId,
              chatId,
              lastMessageId
            );
          } else {
            promise = ctx.telegram.forwardMessage(
              user.chatId,
              chatId,
              lastMessageId
            );
          }
          promises.push(
            promise.catch(async (error) => {
              console.error(`Userga (${user.chatId}) yuborishda xato:`, error);
              await UserModel.updateOne(
                { _id: user._id.toString() },
                { active: false }
              ).catch((err) =>
                console.error("Userni update qilishda xato:", err)
              );
            })
          );
          count++;
        } catch (err) {
          console.error("Ichki try xato:", err);
          await UserModel.updateOne(
            { _id: user._id.toString() },
            { active: false }
          ).catch((err2) =>
            console.error("Userni update qilishda xato:", err2)
          );
        }
      }

      try {
        await Promise.all(promises);
      } catch (err) {
        console.error("Promise.all error:", err);
      }

      currentIndex += chunkSize;
    }

    return ctx.reply(
      `Reklama *${total}* foydalanuvchidan *${count}* foydalanuvchiga yetkazildi!`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    console.error("send_message action error:", err);
    await ctx.reply("Xabar yuborishda umumiy xatolik yuz berdi.");
  }
});

sendMessageScene.hears("◀️ Ortga", async (ctx) => {
  try {
    await ctx.scene.enter("admin");
  } catch (err) {
    console.error("Ortga qaytishda xato:", err);
  }
});
