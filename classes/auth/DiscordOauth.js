/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Parser = require("../../utils/Parser"),
    Request = require("async-request");

/**
 * Global function to authenticate an user
 * @param {*} request - The http request
 * @param {*} response - The http response to send
 * @param {*} code - The callback code from the authentification
 */
const authUser = async function (request, response, code, log = false) {
    let access_token;
    if (!code) {
        const refresh_token = Parser.getCookie(request, "refresh_token"); //The stored refresh_token if it exists
        if (refresh_token) { //If there is a stored refresh_token
            if (refresh_token === "undefined") { //Check if the refresh_token is not empty
                response.redirect(Routes.LOGIN_PAGE); //Redirect to login page
                return;
            } else {
                access_token = await getNewAccessTokenWithRefreshToken(request, response, refresh_token); //Get a new access_token with the refresh_token
            }
        } else {
            response.redirect(Routes.LOGIN_PAGE); //Redirect to login page
            return;
        }
    } else {
        access_token = await getAccessToken(request, response, code); //Get an access_token with the callback code
    }

    const user = await getUserByAccessToken(response, access_token); //Fetch the users informations with the access_token
    if (!user || !access_token) {
        response.redirect(Routes.LOGIN_PAGE);
        return;
    }
    if (log) console.log('{username}#{discriminator}'.formatUnicorn({
        username: user.username,
        discriminator: user.discriminator
    }).yellow + " logged in on ".blue + new Date().toString().yellow + ".".blue + separator);
    return user;
}

/**
 * Disconnect a user from his discord account
 * @param {*} request - The http request
 * @param {*} response - The http response to send
 */
function logoutUser(request, response) {
    response.clearCookie("refresh_token"); //delete the refresh_token cookie
}

/**
 * Returns a link sending on Discord authentification page to authentify the user
 */
const getOauthLink = function (request) {
    const link =
        'https://discord.com/oauth2/authorize?' +
        'client_id={clientID}' + //Your discord app client id
        '&scope={scopes}' + //The scopes (defines which data you will receive after authentifications)
        '&response_type=code' +
        '&callback_uri=${callbackUrl}'; //The url where discord sends you after authentification
    return link.formatUnicorn({
        clientID: Config.DISCORD_CLIENT_ID,
        scopes: Config.DISCORD_OAUTH_SCOPES,
        callbackUrl: request.hostname + Routes.DISCORD_OAUTH_CALLBACK_URL
    });
}

/**
 * Return an oauth access_token
 * @param {*} request - The http request
 * @param {*} response - The http response to send
 * @param {*} code - The callback code from the authentification
 */
const getAccessToken = async function (request, response, code) {
    if (!code) return undefined; //check if there is a code
    let res = await Request(`https://discord.com/api/oauth2/token`, {
        data: {
            "client_id": Config.DISCORD_CLIENT_ID,
            "client_secret": Config.DISCORD_CLIENT_SECRET,
            "grant_type": 'authorization_code',
            "code": code,
            "scope": Config.DISCORD_OAUTH_SCOPES
        },
        method: 'POST'
    });

    const json = JSON.parse(res.body); //Parsing response in json
    await Parser.createCookie(response, "refresh_token", json.refresh_token); //Store or update the refresh_token
    return json.access_token;
}

/**
 * Return an access_token
 * @param {*} request - The http request
 * @param {*} response - The http response to send
 * @param {*} token - The refresh_token used to keep user logged in
 */
const getNewAccessTokenWithRefreshToken = async function (request, response, token) {
    if (!token) return undefined; //check if there is a refresh_token
    let res = await Request(`https://discord.com/api/oauth2/token`, {
        data: {
            "client_id": Config.DISCORD_CLIENT_ID,
            "client_secret": Config.DISCORD_CLIENT_SECRET,
            "grant_type": 'refresh_token',
            "refresh_token": token,
        },
        method: 'POST'
    });

    const json = JSON.parse(res.body); //Parsing response in json
    await Parser.createCookie(response, "refresh_token", json.refresh_token); //Store or update the refresh_token
    return json.access_token;
}

/**
 * Returns the user data
 * @param {*} access_token - The access token from discord oauth 
 */
const getUserByAccessToken = async function (response, access_token) { //Post request to get the user informations defined by the scopes argument
    if (access_token === undefined) return undefined;

    let res = await Request(`https://discord.com/api/users/@me`, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
        method: 'GET'
    });

    const body = JSON.parse(res.body);
    const user = Object.assign(body, {
        access_token: access_token
    });
    return user; //The user informations we asked
}

/**
 * Returns the user guilds
 * @param {*} access_token - The access token from discord oauth 
 */
const getUserGuilds = async function (access_token) {
    if (access_token === undefined) return undefined;

    let res = await Request(`https://discord.com/api/users/@me/guilds`, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
        method: 'GET'
    });

    let response = JSON.parse(res.body)
    for (var k in response) {
        const guild = client.guilds.cache.get(response[k].id);
        response[k].suivix = guild ? "A" : "B";
    }
    let array = [];
    for (var k in response) {
        array[k] = response[k];
    }
    array.sort(function (a, b) {
        return a.suivix.localeCompare(b.suivix);
    });
    return JSON.stringify(array);
}


module.exports = {
    authUser,
    logoutUser,
    getOauthLink,
    getUserByAccessToken,
    getUserGuilds
}