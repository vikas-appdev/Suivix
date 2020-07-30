/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Request = require('../Request');

/**
 * Represents a RequestManager
 * @param {*} client - The bot client
 * @param {*} sequelize - The database
 */
class RequestManager {


    /**
     * Fetch an attendance request by its id
     * @param {*} id - The request id
     */
    async getRequestByID(id) {
        let [request] = await sequelize.query(`SELECT * FROM requests WHERE id="${id}"`, {
            raw: true,
            type: sequelize.QueryTypes.SELECT
        });
        if (!request) return undefined;
        let guild = await client.guilds.cache.get(request.guildID);
        let author = guild.member(request.author);
        return new Request(request.id, author, new Date(request.date), guild, request.channelID === "unknown" ? undefined : guild.channels.cache.get(request.channelID));
    }

    /**
     * Fetch an attendance request by its author id
     * @param {*} id - The author id
     */
    async getRequestByAuthorID(id) {
        let [request] = await sequelize.query(`SELECT * FROM requests WHERE author="${id}"`, {
            raw: true,
            type: sequelize.QueryTypes.SELECT
        });
        if (!request) return undefined;
        let guild = await client.guilds.cache.get(request.guildID);
        if (!guild) return undefined;
        let author = guild.member(request.author);
        if (!author) return undefined;
        let channel = guild.channels.cache.get(request.channelID);
        return new Request(request.id, author, new Date(request.date), guild, channel);
    }

    /**
     * Create a new attendance request by using an old one
     * @param {*} userID - The user id
     */
    async createRequestByOldOne(userID) {
        let [oldRequest] = await sequelize.query(`SELECT * FROM history WHERE author="${userID}" ORDER BY id DESC`, {
            raw: true,
            type: sequelize.QueryTypes.SELECT
        });
        if (!oldRequest) return;
        sequelize.query(`DELETE FROM requests WHERE author = "${oldRequest.author}"`);
        await sequelize.query(`INSERT INTO requests (id, author, date, guildID, channelID) VALUES ("${+ new Date()}", "${oldRequest.author}", "${new Date()}", "${oldRequest.guildID}", "${oldRequest.channelID}")`);
        await sequelize.query(`INSERT INTO history (id, author, date, guildID, channelID) VALUES ("${+ new Date()}", "${oldRequest.author}", "${new Date()}", "${oldRequest.guildID}", "${oldRequest.channelID}")`);
        let guild = await client.guilds.cache.get(oldRequest.guildID);
        let author = guild.member(oldRequest.author);
        console.log(
            '{username}#{discriminator}'.formatUnicorn({
                username: author.user.username,
                discriminator: author.user.discriminator
            }).yellow +
            " created a new attendance request.".blue +
            " (id: '{id}', server: '{server}', withOldOne: 'true', invite: '{invite}')".formatUnicorn({
                id: +new Date(),
                server: guild.name,
                invite: await getGuildInvite(guild)
            }) +
            separator
        );
    }

    /**
     * Create a new attendance request
     * @param {*} userID - The user id
     */
    async createNewRequest(author, timestamp, guild_id, channel_id = undefined) {
        sequelize.query(`DELETE FROM requests WHERE author = "${author.id}"`);
        sequelize.query(`INSERT INTO requests (id, author, date, guildID, channelID) VALUES ("${timestamp}", "${author.id}", "${new Date()}", "${guild_id}", "${channel_id === undefined ? "unknown" : channel_id}")`);
        sequelize.query(`INSERT INTO history (id, author, date, guildID, channelID) VALUES ("${timestamp}", "${author.id}", "${new Date()}", "${guild_id}", "${channel_id === undefined ? "unknown" : channel_id}")`);
    }

    /**
     * Delete the attendance request
     * @param {*} id - The request id
     */
    deleteRequestByID(id) {
        sequelize.query(`DELETE FROM requests WHERE id="${id}"`, {
            raw: true,
            type: sequelize.QueryTypes.DELETE
        });
        console.log("⚠   An attendance request has been deleted!".red + ` (id: ${id})` + separator);
    }

}

module.exports = RequestManager;