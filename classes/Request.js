/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Config = require('../config/Config'),
    Discord = require('discord.js'),
    moment = require('moment');

class Request {

    /**
     * Represents an attendance request
     * @param {*} client - The bot client
     * @param {*} id - The attendance request id
     * @param {Member} author - The attendance request author
     * @param {Date} date - The creation date of the attendance request
     * @param {Guild} guild - The attendance request guild
     * @param {TextChannel} channel - The attendance request channel
     */
    constructor(id, author, date, guild, channel) {
        this.id = id;
        this.author = author;
        this.date = date;
        this.guild = guild;
        this.channel = channel;
    }

    /**
     * Returns the attendance request id
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the attendance request author
     */
    getAuthor() {
        return this.author;
    }

    /**
     * Returns the attendance request creation date
     */
    getDate() {
        return this.date;
    }

    /**
     * Returns the attendance request guild
     */
    getGuild() {
        return this.guild;
    }

    /**
     * Returns the attendance request channel
     */
    getChannel() {
        return this.channel;
    }

    /**
     * Returns the entire list of voice channels in the guild that the user can see
     */
    getVoiceChannels() {
        return this.guild.channels.cache.filter(channel => channel.type === "voice" && channel.permissionsFor(this.author).has('VIEW_CHANNEL'));
    }

    /**
     * Returns the entire list of voice channels categories
     */
    getCategories(channels) {
        let channelsCategories = new Map();
        channels.forEach(function (c) {
            if (c.parent) {
                channelsCategories[c.id] = c.parent.name
            } else {
                channelsCategories[c.id] = "Unknown";
            }
        });
        return channelsCategories
    }

    /**
     * Returns the entire list of roles in the guild
     */
    getRoles() {
        return this.guild.roles.cache;
    }

    /**
     * Return the channel category
     * @param {*} channel - The voice channel
     */
    getCategory(channel, sentence) {
        return channel.parent === null ? sentence : channel.parent.name;
    }

    /**
     * Check if the attendance request is expired
     * @returns {Boolean} - If the request is expired or not
     */
    isExpired() {
        return (Math.abs(this.date - new Date()) / 36e5) > parseInt(Config.ATTENDANCE_VALIDITY_TIME);
    }

    /**
     * Does the suivi
     * @param {*} channel - The voice channel
     * @param {*} role - The role
     * @param {*} timezone - The user timezone
     * @param {+*} language - The user language
     */
    async doAttendance(channel, role, timezone, language) {
        const selector = language === "fr" ? 1 : 0;
        //Traductions
        let unknown = ["Unknown", "Inconnue"];
        let title = ["Attendance of ", "Suivi de "];
        let introSentences = ["Attendance asked by: `{username}`\nCategory: `{category}`\nDate: {date} :clock1:\n\n",
            "Suivi demandé par : `{username}`\nCategorie : `{category}`\nDate : {date} :clock1:\n\n"
        ];
        let noAbsent = ["✅ There is no absent user.\n", "✅ Il n'y a pas d'absent(e)(s).\n"];
        let absentsList = [":warning: List of absent {role}(s):\n\`\`\`", ":warning: Liste des {role}(s) absent(e)(s) :\n\`\`\`"];
        let presentsList = ["\n:man: List of present {role}(s):\n\`\`\`", "\n:man: Liste des {role}(s) présent(e)(s) :\n\`\`\`"];
        let presentsTotal = [":white_check_mark: Total of present {role}(s): `{presents}/{total}`\n", ":white_check_mark: Total des {role}(s) présent(e)(s) : `{presents}/{total}`\n"];
        let absentsTotal = [":x: Total of absents {role}(s): `{absents}/{total}`\n\n", ":x: Total des {role}(s) absent(e)(s) : `{absents}/{total}`\n\n"];
        let tooMuchAbsents = ["Too much users are absent.```", "Trop de personnes sont absentes.```"];
        let tooMuchPresents = ["Too much users are presents.```", "Trop de personnes sont présentes.```"];

        let students = this.guild.roles.cache.find(r => r.id === role.id).members; //fetch user with the role
        let channelStudents = channel.members.filter(member => member.roles.cache.has(role.id)) //fetch users in the voice channel

        let absentsText = "";
        let presentsText = "";
        let absents;
        let presents;

        //Creating the list string of absents users
        let data = this.dataToString(noAbsent[selector], absentsList[selector].formatUnicorn({
            role: role.toString()
        }), students, Array.from(channelStudents.values()));
        absentsText = data.get("text");
        absents = data.get("diff");

        //Creating the list string of presents users
        data = this.dataToString("", presentsList[selector].formatUnicorn({
            role: role.toString()
        }), students, absents);
        presentsText = data.get("text");
        presents = data.get("diff");

        //Parsing text
        const intro = introSentences[selector].formatUnicorn({
            username: (this.author.displayName === this.author.user.username ? this.author.user.username : this.author.nickname + ` (@${this.author.user.username})`),
            category: this.getCategory(channel, unknown[selector]),
            date: this.generateDate(timezone, language)
        });
        const presentSentence = presentsTotal[selector].formatUnicorn({
            role: role.toString(),
            presents: presents.length,
            total: students.size
        });
        const absentSentence = absentsTotal[selector].formatUnicorn({
            role: role.toString(),
            absents: absents.length,
            total: students.size
        });

        //Check if the message is too long to be send in discord
        if (intro.length + absentsText.length + presentsText.length + presentSentence.length + absentSentence.length >= 2048) {
            if (channelStudents.size !== students.size) {
                absentsText = absentsList[selector].formatUnicorn({
                    role: role.toString()
                }) + tooMuchAbsents[selector]; //Minimize text
            } else if (presentUsers.length > 0) {
                presentsText = presentsList[selector].formatUnicorn({
                    role: role.toString()
                }) + tooMuchPresents[selector]; //Minimize text
            }
        }

        //Send result to Discord
        this.channel.send(this.setupDefaultEmbed().setTitle(title[selector] + channel.name) //send result
            .setDescription(intro + presentSentence + absentSentence + absentsText + presentsText).setColor(role.color)).catch((err) => {
            console.log("Error while sending message");
            this.author.send(":x: | Une erreur est survenue au moment d'envoyer le résultat du suivi.\nVeuillez vérifier les permissions du bot dans le salon où vous effectuez le suivi.")
        });

        await this.clearChannel(language); //Clear channel from unfinished suivix queries
    }

    /**
     * Convert data to a string
     * @param {*} basicSentence - The base sentence 
     * @param {*} sentence - The sentence if data is not null
     * @param {*} usersList - All the users
     * @param {*} channelUsers - The users in the voice channel
     */
    dataToString(basicSentence, sentence, usersList, channelUsers) {
        const guild = this.guild;
        let text = basicSentence;
        let collection = usersList.filter(x => channelUsers.indexOf(x) === -1); //compare the two arrays
        let users = Array.from(collection.values()); //Convert into an array
        let usersName = new Array();
        for (let i = 0; i < users.length; i++) { //Create a list with all users name
            usersName[i] = guild.member(users[i]).displayName;
        }
        usersName.sort(); //Sort it A -> Z

        if (users.length > 0) { //If there is more than 1 user
            text = sentence; //Display the sentence when there is users
            for (let i in usersName) { //Create the list
                let user = users.find(u => u.displayName === usersName[i]);
                let member = guild.member(user);
                text += "• " + (member.displayName === user.user.username ? user.user.username : member.nickname + ` (@${user.user.username})`) + "\n";
            }
            text += "```";
        }
        return new Map().set("text", text).set("diff", users);
    }

    /**
     * Clear all suivix attendance request messages in the channel
     */
    async clearChannel(language) {
        let messages = await this.channel.messages.fetch({
            limit: 100
        });
        messages.forEach(function (message) {
            if ((message.embeds.length > 0 && message.embeds[0].title != undefined)) {
                if (message.embeds[0].title.startsWith("Attendance Request") && language === "en") {
                    message.delete().catch(err => console.log("Error when deleting messages"));
                } else if (message.embeds[0].title.startsWith("Demande de suivi") && language === "fr") {
                    message.delete().catch(err => console.log("Error when deleting messages"));
                }
            }
        })
    }

    /**
     * Returns the default embed style for the bot
     */
    setupDefaultEmbed() {
        return new Discord.MessageEmbed().setColor("#36393F").setFooter("2020 - Suivix | All rights reserved | Made with ❤️ by MΛX#2231");
    }

    /**
     * Parse the date
     * @param {*} timezone - The user timezone 
     * @param {*} language - The user language 
     */
    generateDate(timezone, lang) {
        if (timezone === undefined) timezone = "Europe/Paris";
        if (lang === undefined) lang = "fr";
        let dateString = moment(new Date()).tz(timezone).locale(lang).format("LLLL");
        return "`" + dateString.charAt(0).toUpperCase() + dateString.slice(1) + "`";
    };
}
module.exports = Request;