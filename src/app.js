import("./index.js");
import express from "express";
import { bot } from "./core/bot.js";
import { environments } from "./config/environments.js";

const app = express();

app.use(express.json());

app.use("/filmdasizbot", bot.webhookCallback("/secret-path"));
bot.telegram.setWebhook(environments.SERVER_URL);

app.get("/filmdasizbot", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Bot running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Page not found",
  });
});

app.listen(environments.PORT, () => {
  console.log(`Bot launched on port: ${environments.PORT} ${new Date()}`);
});
