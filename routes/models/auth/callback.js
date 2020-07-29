/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const RequestManager = require("../../../classes/managers/RequestManager");

module.exports = async(req, res) => {
    try {
        let user = req.session.passport.user.identity = await oauth.getUser(req.session.passport.user.ticket.access_token);
        user.lastFetched = req.session.passport.user.identity.lastFetched = new Date();
        console.log('{username}#{discriminator}'.formatUnicorn({
            username: user.username,
            discriminator: user.discriminator
        }).yellow + " logged in on ".blue + new Date().toString().yellow + ".".blue + separator);

        const request = await (new RequestManager()).getRequestByAuthorID(user.id);
        if ((!request || request.isExpired()) && req.query.redirect !== "false") {
            res.redirect(Routes.ATTENDANCE_NOREQUEST);
            if (request && request.isExpired()) console.log("⚠   An user tried to use an old attendance request".red + ` (user: '${user.username}#${user.discriminator}')`.yellow + separator);
            if (!request) console.log("⚠   An user tried to use a request which does not exist".red + ` (user: '${user.username}#${user.discriminator}')`.yellow + separator);
        } else if (req.query.redirect === "false") {
            res.redirect(Routes.ATTENDANCE_SERVERS);
        } else {
            res.redirect(Routes.ATTENDANCE_PAGE);
        }
    } catch (err) {
        console.log(err);
        res.sendFile(Server.getApiViewsFile(req, res, Routes.ERROR_500, "/index.html"));
    }
};