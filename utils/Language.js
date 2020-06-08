/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Parser = require("./Parser");

const supportedLanguages = ["en", "en_US", "fr-Fr", "fr"];
const defaultLanguage = "fr-FR";
/**
 * Detect the browser language of the user
 * @param {*} req - The http request
 */
function detectUserLanguage(req, res) {
    let language = req.locale.toLowerCase().includes("fr") ? "fr" : "en";
    saveUserLanguage(res, language);
    return language; //Check if the language is french. If not, returns english.
}

/**
 * Store the selected language into a cookie
 * @param {*} res - The http response to send
 * @param {*} language - The choosen language
 */
function saveUserLanguage(res, language) {
    Parser.createCookie(res, "language", language); //Create or update the cookie
}

/**
 * Get the user language stored in the cookie language
 * @param {*} req - The http request
 */
const getUserLanguage = function (req, res) {
    const cookie = req.cookies["language"]; //Fetch the language cookie
    return cookie === undefined ? detectUserLanguage(req, res) : cookie;
}

module.exports = {
    detectUserLanguage,
    saveUserLanguage,
    getUserLanguage,
    supportedLanguages,
    defaultLanguage
}