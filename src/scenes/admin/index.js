import { adminScene } from "./admin.js";
import { channelsScene } from "./channels.js";
import { channelsAddScene } from "./channels_add.js";
import { channelIdScene } from "./channels_id.js";
import { moviesScene } from "./movies.js";
import { moviesAddScene } from "./movies_add.js";
import { movieIdScene } from "./movies_id.js";
import { sendMessageScene } from "./send.message.js";

export const adminStage = [
    adminScene,
    sendMessageScene,
    moviesScene,
    movieIdScene,
    moviesAddScene,
    channelsScene,
    channelIdScene,
    channelsAddScene
]