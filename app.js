/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const express = require("express"),
  compression = require("compression"),
  locale = require("locale"),
  Config = require("./config/Config"),
  Language = require("./utils/Language"),
  Server = require("./utils/Server"),
  BotClient = require("./bot.js"),
  Routes = require("./routes/routes"),
  cookieParser = require("cookie-parser"),
  Sequelize = require("sequelize");

require("format-unicorn"); //Initialize project formatter

//Node package.json
var package = require("./package.json");

//Bot commands
const SuivixCommand = require("./classes/commands/Suivix"),
  SuivixCommandLines = require("./classes/commands/SuivixCmd");
const { handleLanguageChange } = require("./utils/Language");

//Initialize Database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: __dirname + Config.DATABASE_FILE,
  logging: false,
});

const SuivixClient = new BotClient(); //Launch the Discord bot instance
const app = express(); //Create the express server
const client = SuivixClient.client; //The bot client
const activities = [
  "!suivix help",
  "{students} élèves",
  "{servercount} serveurs",
  "v.{version} | suivix.xyz",
  "{requests} requêtes",
];
let activityNumber = 0;

//App configuration
app.use(compression());
app.use(
  express.static("public", {
    dotfiles: "allow",
  })
);

app.use(function (req, res, next) {
  if (!req.secure && Config.HTTPS_ENABLED === "true") {
    // request was via http, so redirect to https
    res.redirect("https://" + req.headers.host + req.url);
  } else {
    // request was via https, so do no special handling
    next();
  }
});

app.use(cookieParser());
app.use(locale(Language.supportedLanguages, Language.defaultLanguage));

//Bot Client events
//Trigger when the discord client has loaded
client.on("ready", async () => {
  global.client = client;
  global.sequelize = sequelize;
  global.SuivixClient = SuivixClient;
  //Connect all routes to the website
  app.use("/", new Routes().getRoutes());
  //Post some bot stats on the Discord Bot List
  setInterval(() => {
    SuivixClient.postDBLStats();
  }, 1800000);
  //Change suivix activity
  setInterval(async () => {
    if (activityNumber >= activities.length) activityNumber = 0; //Check if the number is too big
    let [requestsQuery] = await sequelize.query(
      `SELECT count(*) AS requests FROM history`,
      {
        raw: true,
      }
    );
    const dblGuild = client.guilds.cache.get("264445053596991498");
    const activity = activities[activityNumber].formatUnicorn({
      servercount: client.guilds.cache.size,
      version: package.version,
      requests: requestsQuery[0].requests,
      students:
        client.users.cache.size - (dblGuild ? dblGuild.members.cache.size : 0),
    }); //Get and parse the activity string
    SuivixClient.setActivity(activity); //Display it
    activityNumber++;
  }, 10000); //Execute every 10 seconds
});

//Trigger when a message is sent
client.on("message", (message) => {
  if (message.author.bot) return; //Returns if the user is not a human
  if (message.content.startsWith(Config.PREFIX) || message.content.startsWith(Config.OPTIONNAL_PREFIX)) {
    const usedPrefix = message.content.startsWith(Config.PREFIX)
      ? Config.PREFIX
      : Config.OPTIONNAL_PREFIX;
    //Check if this is a bot command
    let command = message.content.substring(usedPrefix.length);
    let args = command.split(" ");
    //Simple command handler. For a bigger bot, user a dynamic one
    if (args[0] === "suivix") {
      SuivixCommand.suivixCommand(message, args, client, sequelize); //Launch Command
    } else if (args[0] === "suivixcmd") {
      SuivixCommandLines.suivixCommand(message, args, client); //Launch Command
    }
  }
});

//Trigger when a reaction is add on a message
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return; //If the user is a bot
  if (reaction.message.author !== client.user) return; //if the message is not sent by the bot
  await Language.handleLanguageChange(reaction, user);
});

//Trigger when the bot joins a guild
client.on("guildCreate", (guild) => {
  SuivixClient.displayConsoleChannel(
    "Serveur Discord rejoint : " +
      guild.name +
      " | Membres : " +
      guild.memberCount
  );
});

//Trigger when the bot leaves a guild
client.on("guildDelete", (guild) => {
  SuivixClient.displayConsoleChannel(
    "Serveur Discord quitté : " +
      guild.name +
      " | Membres : " +
      guild.memberCount
  );
});

//Launching web servers
// * Check for https certificate path in the config file before enabling https.
Server.initHttpServer(app, Config.HTTP_PORT);
Server.initHttpsServer(app, Config.HTTPS_PORT, Config.HTTPS_ENABLED);
