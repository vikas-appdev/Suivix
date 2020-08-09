/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const RequestManager = require('../../../classes/managers/RequestManager');

module.exports = async (req, res) => {
    try {
        if (!req.session.passport.user.identity) {
            res.redirect(Routes.LOGIN_PAGE);
        } else {
            if (req.query.guild_id) {
                const request = await new RequestManager().createNewRequest("attendance", +new Date(), req.session.passport.user.identity, req.query.guild_id);
                req.session.passport.user.attendance_request = request;
                console.log(
                    '{username}#{discriminator}'.formatUnicorn({
                        username: req.session.passport.user.identity.username,
                        discriminator: req.session.passport.user.identity.discriminator
                    }).yellow +
                    " created a new attendance request.".blue +
                    " (id: '{id}', server: '{server}')".formatUnicorn({
                        id: +new Date(),
                        server: req.query.guild_id,
                    }) +
                    separator
                );
                res.redirect(Routes.ATTENDANCE_PAGE);
            } else {
                res.redirect(Routes.ATTENDANCE_SERVERS);
            }
        }
    } catch (err) {
        console.log(err);
        res.sendFile(Server.getApiViewsFile(req, res, Routes.ERROR_500, "/index.html"));
    }
};