/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const RequestManager = require('../../../classes/managers/RequestManager');

module.exports = async(req, res) => {
    try {
        if (!req.session.passport.user.identity) {
            res.redirect(Routes.LOGIN_PAGE);
        } else {
            if (req.query.guild_id) {
                (new RequestManager()).createNewRequest(req.session.passport.user.identity, +new Date(), req.query.guild_id);
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
