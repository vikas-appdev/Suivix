/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Auth = require('../../../auth/DiscordOauth');

module.exports = (req, res) => {
    res.status(300).redirect(Auth.getOauthLink(req));
};