/*
* Copyright (c) 2020, MΛX! Inc.  All rights reserved.
* Copyrights licensed under the GNU General Public License v3.0.
* See the accompanying LICENSE file for terms.
*/
const Config = require('../../../config/Config'),
    Routes = require('../../../config/Routes');

module.exports = (req, res) => {
    const protocol = Config.HTTPS_ENABLED === "true" ? "https" : "http";
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${Config.DISCORD_CLIENT_ID}&scope=bot&permissions=134597728&response_type=code&redirect_uri=${protocol}://${Config.WEBSITE_HOST}${Routes.HOME_PAGE}`);
};