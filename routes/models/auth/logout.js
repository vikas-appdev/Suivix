/*
* Copyright (c) 2020, MΛX! Inc.  All rights reserved.
* Copyrights licensed under the GNU General Public License v3.0.
* See the accompanying LICENSE file for terms.
*/
const Auth = require('../../../auth/DiscordOauth'),
    Routes = require('../../../config/Routes');

module.exports = (req, res) => {
    Auth.logoutUser(req, res);
    res.redirect(req.query.redirectTo);
};