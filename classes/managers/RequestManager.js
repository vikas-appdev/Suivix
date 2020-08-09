/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const AttendanceRequest = require('../AttendanceRequest'),
    PollRequest = require('../PollRequest');

/**
 * Represents a RequestManager
 * @param {*} client - The bot client
 * @param {*} sequelize - The database
 */
class RequestManager {

    /**
     * Fetch an attendance request
     * @param {*} request - The request 
     */
    async getRequest(request) {
        if (!request) return undefined;
        let guild = await client.guilds.cache.get(request.guild_id);
        let author = guild.member(request.author.id);
        if (request.type === "attendance") return new AttendanceRequest(request.id, author, new Date(request.date), guild, request.isExpired);
        else return new PaullRequest(request.id, author, new Date(request.date), guild, request.isExpired);
    }

    /** 
     * Create a new request
     * @param {String} type - The request type (Paull or Attendance)
     * @param {*} timestamp - The timestamp when the user created the request
     * @param {Json} author - The request author
     * @param {String} guild_id - The guild id where the user started the request
     * @param {*} channel_id - The id of the channel were user started the poll (optional)
     * @param {*} message_id - The id of the message to edit for further modifications (optional)
     */
    async createNewRequest(type, timestamp, author, guild_id, channel_id = undefined, message_id = undefined) {
        return {
            type: type,
            id: timestamp,
            author: author,
            date: new Date(),
            guild_id: guild_id,
            channel_id: channel_id,
            message_id: message_id,
            isExpired: false,
        }
    }

    /**
     * Delete the request
     * @param {*} request - The request
     */
    deleteRequestByID(request) {
        if (request.type === "attendance") console.log("⚠   An attendance request has been deleted!".red + ` (id: ${request.id})` + separator);
        else console.log("⚠   A paull request has been deleted!".red + ` (id: ${request.id})` + separator);
        return undefined;
    }

}

module.exports = RequestManager;