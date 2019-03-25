// replace the value below with the Telegram token you receive from @BotFather
const token = "YOUR TOKEN";

const Telegraf = require("telegraf");
const express = require("express");
const expressApp = express();

require("dotenv").config();
const owm = require("./controllers/openWeatherMap.js");

const port = process.env.PORT || 3000;
expressApp.get("/", (req, res) => {
  res.send("Hello World!");
});
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const bot = new Telegraf(token);

// Runs on start for new user.
bot.start(ctx => {
  console.log("started:", ctx.from.id);
  return ctx.reply(`Welcome to Weather Bot! 
  See /help for usage. Source: Open Weather Map https://openweathermap.org/`);
});

// Find weather by city name.
bot.hears(/city/i, ctx => {
  // Remove '/city' from the city name string before sending.
  if (ctx && ctx.update && ctx.update.message && ctx.update.message.text) {
    let city = ctx.update.message.text.slice(6, ctx.update.message.text.length);
    owm.byName(ctx, city);
  } else {
    console.error(ctx);
    ctx.reply(`Something went wrong.`);
  }
});

// Find weather by zip code
bot.hears(/zip/i, ctx => {
  // Remove '/city' from the city name string before sending.
  if (ctx && ctx.update && ctx.update.message && ctx.update.message.text) {
    let zip_and_country = ctx.update.message.text.slice(
      5,
      ctx.update.message.text.length
    );
    let split = zip_and_country.split(" ");
    let zip = split[0];
    let country = split[1];
    owm.byZip(ctx, zip, country);
  } else {
    console.error(ctx);
    ctx.reply(`Something went wrong.`);
  }
});

// bot.hears(/getLocation/, (msg) => {
//   const opts = {
//     reply_markup: JSON.stringify({
//       keyboard: [
//         [{text: 'Location', request_location: true}],
//         [{text: 'Contact', request_contact: true}],
//       ],
//       resize_keyboard: true,
//       one_time_keyboard: true,
//     }),
//   };
//   bot.sendMessage(msg.chat.id, 'Contact and Location request', opts);
// });

// bot.on('location', (msg) => {
//   console.log(msg.location.latitude);
//   console.log(msg.location.longitude);
// });

// Find weather by location.
bot.on("location", ctx => {
  if (ctx && ctx.message && ctx.message.location) {
    owm.byLocation(ctx, ctx.message.location);
  } else {
    console.error(ctx);
    ctx.reply(`Something went wrong.`);
  }
});

// Help command.
bot.command("help", ctx =>
  ctx.reply(
    `Usage: 
  /city San Diego
  /zip 92120
  /zip 100-0001 JP
  `
  )
);

// Be polite.
bot.hears("hi", ctx => ctx.reply("Hey there!"));
bot.hears("thx", ctx => ctx.reply(`You're welcome.`));
bot.startPolling();
