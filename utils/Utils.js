/*
* Copyright (c) 2020, MΛX! Inc.  All rights reserved.
* Copyrights licensed under the GNU General Public License v3.0.
* See the accompanying LICENSE file for terms.
*/
/**
 * Fetch the user by his id and convert it to an guild member
 * @param {*} client - The bot client
 * @param {*} guild - The guild where the command has been runned
 * @param {*} id - The user id
 */
function getMemberById(client, guild, id) {
    client.users.cache.get(id);
    return guild.member(user);
}

/**
 * Fetch a guild by its id
 * @param {*} client - The bot client
 * @param {*} id - The guild id
 */
function getGuildById(client, id) {
    return client.guilds.cache.get(id);
}

/**
* Fetch a channel by its id
* @param {*} guild - The guild where the command has been runned
* @param {*} id - The channel id
*/
function getChannelById(guild, id) {
    return guild.channels.cache.get(id);
}

module.exports = {
    getMemberById,
    getGuildById,
    getChannelById
}