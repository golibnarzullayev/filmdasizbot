import("./index.js");
import express from "express";
import { bot } from "./core/bot.js";
import { environments } from "./config/environments.js";

const app = express();

app.use(express.json());

async function launchWebhook() {
  const webhook = await bot.createWebhook({ domain: environments.SERVER_URL });
  app.get("/ping", (_, res) => res.send("Pong!"));
  app.use(webhook);
  app.listen(config.port, () => {
    logger.info(`Production server is listening on port ${config.port}`);
  });
}

launchWebhook().then();

app.listen(environments.PORT, () => {
  console.log(`Bot launched on port: ${environments.PORT} ${new Date()}`);
});
