/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const express = require("express"),
  locale = require('locale'),
  Config = require('./config/Config'),
  Language = require('./utils/Language'),
  Server = require('./utils/Server'),
  BotClient = require("./bot.js"),
  Routes = require('./routes/routes'),
  cookieParser = require('cookie-parser'),
  Sequelize = require('sequelize');

//Node package.json
var package = require('./package.json');

//Bot commands
const SuivixCommand = require('./classes/commands/Suivix'),
  SuivixCommandLines = require('./classes/commands/SuivixCmd');

//Initialize Database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: __dirname + Config.DATABASE_FILE,
  logging: false
});

const SuivixClient = new BotClient(); //Launch the Discord bot instance
const app = express() //Create the express server
const client = SuivixClient.client; //The bot client
const activities = ['!suivix help', '{students} élèves', '{servercount} serveurs', 'v.{version} | suivix.xyz', '{requests} requêtes'];
let activityNumber = 0;

//App configuration
app.use(express.static("public", {
  dotfiles: 'allow'
}));
app.use(cookieParser());
app.use(locale(Language.supportedLanguages, Language.defaultLanguage))

//Bot Client events
client.on('ready', async () => { //Trigger when the discord client has loaded
  //Connect all routes to the website
  app.use('/', new Routes(client, sequelize).getRoutes());
  //Post some bot stats on the Discord Bot List
  setInterval(() => {
    SuivixClient.postDBLStats();
  }, 1800000);
  //Change suivix activity
  setInterval(async () => {
    if (activityNumber >= activities.length) activityNumber = 0; //Check if the number is too big
    let [requestsQuery] = await sequelize.query(`SELECT count(*) AS requests FROM history`, {
      raw: true
    });
    const activity = activities[activityNumber].formatUnicorn({
      servercount: client.guilds.cache.size,
      version: package.version,
      requests: requestsQuery[0].requests,
      students: client.users.cache.size
    }); //Get and parse the activity string
    SuivixClient.setActivity(activity); //Display it
    activityNumber++;
  }, 10000); //Execute every 10 seconds
});

client.on('message', (message) => { //Trigger when a message is sent
  if (message.author.bot) return; //Returns if the user is not a human
  if (message.content.startsWith("!") || message.content.startsWith("y")) { //Check if this is a bot command
    let command = message.content.substring(1);
    let args = command.split(" ");
    if (args[0] === "suivix") { //Simple command handler. For a bigger bot, user a dynamic one
      SuivixCommand.suivixCommand(message, args, client, sequelize); //Launch Command
    } else if (args[0] === "suivixcmd") {
      SuivixCommandLines.suivixCommand(message, args, client); //Launch Command
    }
  }
});

client.on('messageReactionAdd', async (reaction, user) => { //Trigger when a reaction is add on a message
  if (user.bot) return; //If the user is a bot
  if (reaction.message.author !== client.user) return; //if the message is not sent by the bot
  if (reaction.emoji.name !== "🇫🇷" && reaction.emoji.name !== "🇬🇧") return;
  var react = reaction.emoji.name === "🇫🇷" ? "fr" : "en";
  let [dbUser] = await sequelize.query(`SELECT * FROM users WHERE id = ${user.id}`, {
    raw: true
  });
  if (!dbUser[0]) {
    sequelize.query(`INSERT INTO users (id, language) VALUES ("${user.id}", "${react}")`);
  } else {
    if (dbUser[0].language === react) return;
    sequelize.query(`UPDATE users SET language = "${react}" WHERE id = "${user.id}"`);
  }
  await SuivixClient.sendChangedLanguageMessage(reaction.message.channel, react, user)
});

client.on("guildCreate", (guild) => { //Trigger when the bot joins a guild
  displayConsoleChannel("Serveur Discord rejoint : " + guild.name + " | Membres : " + guild.memberCount);
});
client.on("guildDelete", (guild) => { //Trigger when the bot leaves a guild
  displayConsoleChannel("Serveur Discord quitté : " + guild.name + " | Membres : " + guild.memberCount);
});

/**
 * Send a message in the channel "console" of the bot main server
 * @param {String} message
 */
function displayConsoleChannel(message) {
  client.guilds.cache.get(Config.MAIN_SERVER_ID).channels.cache.get(Config.CONSOLE_CHANNEL_ID).send(message).catch(err => console.log('Error while sending log message.'));
}

//Launching web servers
Server.initHttpServer(app, Config.HTTP_PORT);
Server.initHttpsServer(app, Config.HTTPS_PORT, Config.HTTPS_ENABLED);