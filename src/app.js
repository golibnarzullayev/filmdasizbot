import express from "express";
import { bot } from "./core/bot.js";
import { environments } from "./config/environments.js";
import { ready } from "./index.js";

const app = express();

app.use(express.json());

async function launchWebhook() {
  await ready;
  const webhook = await bot.createWebhook({ domain: environments.SERVER_URL });
  app.get("/ping", (_, res) => res.send("Pong!"));
  app.use(webhook);
  app.listen(environments.PORT, () => {
    console.log(`Production server is listening on port ${environments.PORT}`);
  });
}

launchWebhook().catch((error) => {
  console.error("Webhook launch failed:", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
});

process.on("unhandledRejection", (error) => {
  console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
});
