/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Auth = require('../../../classes/auth/DiscordOauth');

module.exports = (req, res) => {
    Auth.logoutUser(req, res);
    res.redirect(req.query.redirectTo);
};