/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const http = require('http'),
    fs = require('fs'),
    https = require('https'),
    Config = require('../config/Config'),
    Language = require('./Language');

/**
 * Start a http server
 * @param {*} app - The express js app
 * @param {*} port - The http port
 */
function initHttpServer(app, port) {
    const httpServer = http.createServer(app); // The https server
    httpServer.listen(port, () => {
        console.log(`The http server is now listening on port ${port}`)
    });
}

/**
 * Start a https server
 * @param {*} app - The express js app
 * @param {*} port - The https port
 * @param {String} httpsEnabled - If the https is enabled in config
 */
function initHttpsServer(app, port, httpsEnabled) {
    if (httpsEnabled !== "true") return;
    //Certificate for https
    const credentials = {
        key: fs.readFileSync(Config.CERTIFICATE_PRIVKEY),
        cert: fs.readFileSync(Config.CERTIFICATE),
        ca: fs.readFileSync(Config.CERTIFICATE_CHAIN)
    };
    const httpsServer = https.createServer(credentials, app); //The https server (if activated)
    httpsServer.listen(port, () => {
        console.log(`The https server is now listening on port ${port}`)
    });
}

const getViewsFile = function (req, res, path, params, lang) {
    let language = lang === undefined ? Language.getUserLanguage(req, res) : lang;
    if (language != "en" && language != "fr") language = "en";
    Language.saveUserLanguage(res, language);
    return __dirname.replace("utils", "") + Config.APP_VIEWS_DIRECTORY + language + path + params + "index.html"
}

const getApiViewsFile = function (req, res, path, params) {
    return __dirname.replace("utils", "") + Config.APP_VIEWS_DIRECTORY + path + params;
}

module.exports = {
    initHttpServer,
    initHttpsServer,
    getViewsFile,
    getApiViewsFile
};