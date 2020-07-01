/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Discord = require("discord.js"),
  DBL = require("dblapi.js");

class BotClient {
  constructor() {
    this.client = new Discord.Client();
    this.login();
    if (Config.TOPGG_API_TOKEN) {
      this.dbl = new DBL(Config.TOPGG_API_TOKEN, this.client);
      console.log("Discord Bot List API initialized!" + separator);
    }
  }

  /**
   * Send a message in the channel "console" of the bot main server
   * @param {String} message
   */
  displayConsoleChannel(message) {
    this.client.guilds.cache
      .get(Config.MAIN_SERVER_ID)
      .channels.cache.get(Config.CONSOLE_CHANNEL_ID)
      .send(message)
      .catch((err) => console.log("⚠   Error while sending ".red + "CONSOLE_MESSAGE" + " message!".red + ` (server: '${guild.name}')` + separator));
  }

  /**
   * Set the bot activity text
   * @param {String} activity - The activity text
   * @param {*} args - Optionals arguments
   */
  setActivity(activity) {
    this.client.user
      .setActivity(activity, {
        type: "WATCHING",
      })
      .catch(console.error);
  }

  /**
   * Launch the bot instance for Discord
   */
  login() {
    var suivixArt =
      "────────────────────────────────────\n   _____         _         _       \n  / ____|       (_)       (_)      \n | (___   _   _  _ __   __ _ __  __\n  \\___ \\ | | | || |\\ \\ / /| |\\ \\/ /\n  ____) || |_| || | \\ V / | | >  < \n |_____/  \\__,_||_|  \\_/  |_|/_/\\_\\\n────────────────────────────────────\nSuivix Bot Client has been launched !" + separator;
    this.client.login(Config.DISCORD_CLIENT_TOKEN);
    console.log(suivixArt.gray.bold);
  }

  /**
   * Upload the bot guilds count on DBL
   */
  postDBLStats() {
    if (!Config.TOPGG_API_TOKEN) return;
    this.dbl
      .postStats(this.client.guilds.cache.size)
      .catch((err) => console.log("Unable to post top.gg stats."));
  }
}

module.exports = BotClient;
