/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Discord = require("discord.js"),
    DBL = require("dblapi.js"),
    Config = require('./config/Config'),
    Parser = require("./utils/Parser"),
    formatUnicorn = require('format-unicorn');

class BotClient {

    constructor() {
        this.client = new Discord.Client();
        this.login();

        if (Config.TOPGG_API_TOKEN) {
            this.dbl = new DBL(Config.TOPGG_API_TOKEN, this.client);
            console.log("Discord Bot List API initialized !");
        }

    }

    /**
     * Send a message in the channel "console" of the bot main server
     * @param {String} message
     */
    displayConsoleChannel(message) {
        this.client
            .guilds.cache.get(Config.MAIN_SERVER_ID)
            .channels.cache.get(Config.CONSOLE_CHANNEL_ID)
            .send(message)
            .catch(console.error);
    }

    /**
     * Set the bot activity text
     * @param {String} activity - The activity text
     * @param {*} args - Optionals arguments
     */
    setActivity(activity) {
        this.client.user
            .setActivity(activity, {
                type: 'WATCHING'
            })
            .catch(console.error);
    }

    /**
     * Launch the bot instance for Discord
     */
    login() {
        var suivixArt = '   _____         _         _       \n  / ____|       (_)       (_)      \n | (___   _   _  _ __   __ _ __  __\n  \\___ \\ | | | || |\\ \\ / /| |\\ \\/ /\n  ____) || |_| || | \\ V / | | >  < \n |_____/  \\__,_||_|  \\_/  |_|/_/\\_\\\n────────────────────────────────────\nSuivix Bot Client has been launched !'

        this.client.login(Config.DISCORD_CLIENT_TOKEN);
        console.log(suivixArt)
    }

    /**
     * Upload the bot guilds count on DBL
     */
    postDBLStats() {
        if (!Config.TOPGG_API_TOKEN) return;
        this.dbl.postStats(this.client.guilds.cache.size).catch(err => console.log("Unable to post top.gg stats."));
    }

    /**
     * Send the changed language alert
     * @param {*} channel - The text channel were the action happened
     * @param {*} language - The new language
     * @param {*} user - The user
     */
    async sendChangedLanguageMessage(channel, language, user) {
        let sentences = [":flag_fr: | {username}, `Suivix` vous parlera désormais en **français**.", ":flag_gb: | {username}, `Suivix` will now talk to you in **english**."];
        let msg = await channel.send(sentences[language === "fr" ? 0 : 1].formatUnicorn({
            username: user.username
        }));
        msg.delete({
            timeout: 20000
        });
    }



}

module.exports = BotClient;