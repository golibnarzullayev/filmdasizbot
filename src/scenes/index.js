import { Scenes } from "telegraf";
import { startScene } from "./start.js";
import { adminStage } from "./admin/index.js";

export const stage = new Scenes.Stage([
    startScene,
    ...adminStage
])