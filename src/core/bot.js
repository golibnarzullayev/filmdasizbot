import { Telegraf } from "telegraf";
import { environments } from "../config/environments.js";

export const bot = new Telegraf(environments.BOT_TOKEN)