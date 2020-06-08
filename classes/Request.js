/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Config = require('../config/Config'),
    Discord = require('discord.js');

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
                channelsCategories[c.id] = "Unknown"
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
        let title = ["Attendance of ", "Suivi de "];
        let introSentences = ["Attendance asked by: `{username}`\nCategory: `{category}`\nDate: {date} :clock1:\n\n",
            "Suivi demandé par : `{username}`\nCategorie : `{category}`\nDate : {date} :clock1:\n\n"
        ];
        let noAbsent = ["✅ There is not absent.\n", "✅ Il n'y a pas d'absents.\n"];
        let absentsList = [":warning: List of absent {role}(s):\n\`\`\`", ":warning: Liste des {role}(s) absent(e)(s) :\n\`\`\`"];
        let presentsList = ["\n:man: List of present {role}(s):\n\`\`\`", "\n:man: Liste des {role}(s) présent(e)(s) :\n\`\`\`"];
        let presentsTotal = [":white_check_mark: Total of present {role}(s): `{presents}/{total}`\n", ":white_check_mark: Total des {role}(s) présent(e)(s) : `{presents}/{total}`\n"];
        let absentsTotal = [":x: Total of absents {role}(s): `{absents}/{total}`\n\n", ":x: Total des {role}(s) absent(e)(s) : `{absents}/{total}`\n\n"];
        let tooMuchAbsents = ["Too much users are absent.```", "Trop de personnes sont absentes.```"];
        let tooMuchPresents = ["Too much users are presents.```", "Trop de personnes sont présentes.```"];

        let students = this.guild.roles.cache.find(r => r.id === role.id).members; //fetch user with the role
        let channelStudents = channel.members.filter(member => member.roles.cache.has(role.id)) //fetch users in the voice channel
        const guild = this.guild;

        let intro = introSentences[selector].formatUnicorn({
            username: (this.author.displayName === this.author.user.username ? this.author.user.username : this.author.nickname + ` (@${this.author.user.username})`),
            category: this.getCategory(channel),
            date: this.generateDate(timezone, language)
        });

        let absentsText = noAbsent[selector];
        let absentUsersCollection = students.filter(x => Array.from(channelStudents.values()).indexOf(x) === -1); //compare the two arrays to get absent users
        let absentUsers = Array.from(absentUsersCollection.values()); //Convert into an array
        let absentUsersName = new Array();

        let presentUsersText = "";
        let presentUsersCollection = students.filter(x => !absentUsers.includes(x)); //get users who are not absent
        let presentUsers = Array.from(presentUsersCollection.values()); //convert into an array
        let presentUsersName = new Array();

        let i = 0;
        absentUsers.forEach(function (u) {
            absentUsersName[i] = guild.member(u).displayName;
            i++
        })
        absentUsersName.sort(function (a, b) { //sort users name 
            return a.localeCompare(b);
        });

        i = 0;
        presentUsers.forEach(function (u) {
            presentUsersName[i] = guild.member(u).displayName;
            i++
        })
        presentUsersName.sort(function (a, b) { //sort users name
            return a.localeCompare(b);
        });

        if (channelStudents.size !== students.size) { //if the is some absents
            absentsText = absentsList[selector].formatUnicorn({
                role: role.toString()
            })
            for (let i in absentUsersName) {
                let user = absentUsers.find(u => u.displayName === absentUsersName[i]);
                let member = guild.member(user);
                absentsText += "• " + (member.displayName === user.user.username ? user.user.username : member.nickname + ` (@${user.user.username})`) + "\n";
            }
            absentsText += "```";
        }

        if (presentUsers.length > 0) { //check if there is some present users
            presentUsersText = presentsList[selector].formatUnicorn({
                role: role.toString()
            })
            for (let i in presentUsersName) {
                let user = presentUsers.find(u => u.displayName === presentUsersName[i]);
                let member = guild.member(user);
                presentUsersText += "• " + (member.displayName === user.user.username ? user.user.username : member.nickname + ` (@${user.user.username})`) + "\n";
            }
            presentUsersText += "```";
        }

        let presentSentence = presentsTotal[selector].formatUnicorn({
            role: role.toString(),
            presents: presentUsers.length,
            total: students.size
        });
        let absentSentence = absentsTotal[selector].formatUnicorn({
            role: role.toString(),
            absents: absentUsers.length,
            total: students.size
        });
        let total = presentSentence + absentSentence;
        if (intro.length + absentsText.length + presentUsersText.length + total.length >= 2048) {
            if (channelStudents.size !== students.size) {
                absentsText = absentsList[selector].formatUnicorn({
                    role: role.toString()
                }) + tooMuchAbsents[selector];
            } else if (presentUsers.length > 0) {
                presentUsersText = presentsList[selector].formatUnicorn({
                    role: role.toString()
                }) + tooMuchPresents[selector];
            }
        }

        this.channel.send(this.setupDefaultEmbed().setTitle(title[selector] + channel.name) //send result
            .setDescription(intro + total + absentsText + presentUsersText).setColor(role.color)).catch((err) => {
            console.log("Error while sending message");
            this.author.send(":x: | Une erreur est survenue au moment d'envoyer le résultat du suivi.\nVeuillez vérifier les permissions du bot dans le salon où vous effectuez le suivi.")
        });

        await this.clearChannel(language);
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
     * Return the channel category
     * @param {*} channel - The voice channel
     */
    getCategory(channel) {
        return channel.parent === null ? "Unknown" : channel.parent.name;
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
        let date = lang === "fr" ? new Date().toLocaleString("fr-Fr", {
            timeZone: `${timezone}`
        }) : new Date().toLocaleString("en-US", {
            timeZone: `${timezone}`
        });
        return "**" + date.toString() + "**";
    };
}
module.exports = Request;