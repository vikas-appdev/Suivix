/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const routes = require('express').Router(),
    Config = require('../config/Config'),
    routesConfig = require('../config/Routes');

//Global imports
const home = require("./models/home"),
    contact = require("./models/contact"),
    login = require("./models/login");

//Errors
const error404 = require('./models/error/404'),
    compatibility = require('./models/error/compatibility');

//Authentification imports
const authLogin = require("./models/auth/login"),
    authLogout = require("./models/auth/logout"),
    callback = require("./models/auth/callback");

//Attendance
const welcome = require('./models/attendance/welcome'),
    option1 = require('./models/attendance/options/1'),
    option2 = require('./models/attendance/options/2'),
    done = require('./models/attendance/done'),
    noRequest = require('./models/attendance/noRequest'),
    newRequest = require('./models/attendance/newRequest');

//Api imports
const getUser = require('./models/api/user'),
    getUrl = require('./models/api/url'),
    getNavbar = require('./models/api/navbar'),
    getChannels = require('./models/api/channels'),
    getCategories = require('./models/api/categories'),
    getRoles = require('./models/api/roles'),
    getStats = require('./models/api/stats'),
    getChangelog = require('./models/api/changelog'),
    getInviteLink = require('./models/api/invite');

class Routes {

    constructor(client, sequelize) {
        this.client = client;
        this.sequelize = sequelize;
    }

    getRoutes() {
        //Global
        routes.get(routesConfig.HOME_PAGE, (req, res) => {
            home(req, res, undefined)
        });
        routes.get(routesConfig.HOME_PAGE + "fr", (req, res) => {
            home(req, res, "fr")
        });
        routes.get(routesConfig.HOME_PAGE + "en", (req, res) => {
            home(req, res, "en")
        });
        routes.get(routesConfig.LOGIN_PAGE, login);

        //Error
        routes.get(routesConfig.ERROR_404, error404);
        routes.get(routesConfig.ERROR_COMPATIBILITY, compatibility);

        //Authentification
        routes.get(routesConfig.LOGIN_REDIRECT, authLogin);
        routes.get(routesConfig.LOGOUT_REDIRECT, authLogout);
        routes.get(routesConfig.DISCORD_OAUTH_CALLBACK_URL, (req, res) => {
            callback(req, res, this.client, this.sequelize);
        });

        //Attendance
        routes.get(routesConfig.ATTENDANCE_PAGE, welcome);
        routes.get(routesConfig.ATTENDANCE_PAGE_OPTION_1, option1);
        routes.get(routesConfig.ATTENDANCE_PAGE_OPTION_2, option2);
        routes.get(routesConfig.ATTENDANCE_PAGE_DONE, (req, res) => {
            done(req, res, this.client, this.sequelize);
        });
        routes.get(routesConfig.ATTENDANCE_NOREQUEST, noRequest);
        routes.get(routesConfig.ATTENDANCE_NEWREQUEST, (req, res) => {
            newRequest(req, res, this.client, this.sequelize);
        });

        //Api
        routes.get(routesConfig.API_USER_URL, (req, res) => {
            getUser(req, res, this.client, this.sequelize);
        });
        routes.get(routesConfig.API_URL_FETCHER_URL, getUrl);
        routes.get(routesConfig.API_NAVBAR_URL, getNavbar);
        routes.get(routesConfig.API_CHANNELS_URL, (req, res) => {
            getChannels(req, res, this.client, this.sequelize);
        });
        routes.get(routesConfig.API_CATEGORIES_URL, (req, res) => {
            getCategories(req, res, this.client, this.sequelize);
        });
        routes.get(routesConfig.API_ROLES_URL, (req, res) => {
            getRoles(req, res, this.client, this.sequelize);
        });
        routes.get(routesConfig.API_STATS_URL, (req, res) => {
            getStats(req, res, this.client, this.sequelize);
        });
        routes.get(routesConfig.API_CHANGELOG_URL, getChangelog);
        routes.get(routesConfig.API_INVITE_URL, getInviteLink);

        //Handle 404 error
        routes.get('*', (req, res) => {
            console.log( req.url.includes('.map') ? "" : "404 -> " + req.url);
            res.status(404).redirect(routesConfig.ERROR_404);
        });

        return routes;
    }
}



module.exports = Routes;