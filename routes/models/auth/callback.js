/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Auth = require("../../../classes/auth/DiscordOauth"),
    RequestManager = require("../../../classes/managers/RequestManager");

module.exports = async(req, res) => {
    const user = await Auth.authUser(req, res, req.query.code, true);
    if (!user) {
        res.redirect(Routes.LOGIN_PAGE);
        return;
    };
    const request = await (new RequestManager()).getRequestByAuthorID(user.id);
    if ((!request || request.isExpired()) && req.query.redirect !== "false") {
        res.redirect(Routes.ATTENDANCE_NOREQUEST);
        if (request && request.isExpired()) console.log("⚠   An user tried to use an old attendance request".red + ` (user: '${user.username}#${user.discriminator}')`.yellow + separator);
        if (!request) console.log("⚠   An user tried to use a request which does not exist".red + ` (user: '${user.username}#${user.discriminator}')`.yellow + separator);
        return;
    } else if (req.query.redirect === "false") {
        res.cookie("access_token", user.access_token, {
            maxAge: 60000, // Lifetime
        });
        res.redirect(Routes.ATTENDANCE_SERVERS);
    } else {
        res.cookie("access_token", user.access_token, {
            maxAge: 60000, // Lifetime
        });
        res.redirect(Routes.ATTENDANCE_PAGE);
    }
};