/*
* Copyright (c) 2020, MΛX! Inc.  All rights reserved.
* Copyrights licensed under the GNU General Public License v3.0.
* See the accompanying LICENSE file for terms.
*/
var Config = require("../config/Config");

/**
 * Replace All String Occurrences
 * @param {*} string - The string
 * @param {*} search - The word/sentence to replace
 * @param {*} replace - The replacement
 */
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

/**
* Create a cookie
* @param {*} response - The http(s) response to send
* @param {*} name - The cookie name
* @param {*} value - The cookie value
*/
async function createCookie(response, name, value) {
    response.cookie(name, value, {
        secure: Config.HTTPS_ENABLED === "true" ? true : false, //Secures the cookie if https enabled
        httpOnly: true, //Another security setting
        maxAge: 360 * 24 * 60 * 60 * 1000 //The cookie expires in 1 year
    });
}

/**
 * Returns a cookie
 * @param {*} request - The http request
 * @param {*} name - The cookie name
 */
function getCookie(request, name) {
    return request.cookies[name];
}

module.exports = {
    replaceAll,
    createCookie,
    getCookie
}