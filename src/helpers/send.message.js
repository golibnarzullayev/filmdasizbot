import { bot } from "../core/bot.js";
import { UserModel } from "../models/user.model.js";
import { errorHandler } from "./error.handler.js";

export const sendMessage = async (userId, chatId, lastMessageId) => {
  try {
    const status = await bot.telegram
      .sendChatAction(userId, "typing")
      .catch(() => false);

    if (status) {
      await bot.telegram.copyMessage(userId, chatId, lastMessageId);
    } else {
      await UserModel.findOneAndUpdate({ chatId }, { active: false });
    }

    return status;
  } catch (error) {
    errorHandler(error);
  }
};
