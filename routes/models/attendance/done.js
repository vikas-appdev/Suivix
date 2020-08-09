/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const RequestManager = require('../../../classes/managers/RequestManager');

module.exports = async (req, res) => {
    try {
        const manager = new RequestManager();

        if (!req.session.passport.user.identity) { //Check if the user exists or is the right one
            res.redirect(Routes.LOGIN_PAGE);
        } else if (!req.session.passport.user.attendance_request) {
            res.redirect(Routes.ATTENDANCE_SERVERS);
        } else {
            const request = await manager.getRequest(req.session.passport.user.attendance_request);
            if (!request || request.isExpired()) { //Check if there is an attendance request and if it's expired
                res.redirect(Routes.ATTENDANCE_NOREQUEST);
            } else {
                await request.doAttendance(req.query.channels, req.query.roles, req.cookies["timezone"], req.cookies["language"]);
                req.session.passport.user.attendance_request = manager.deleteRequestByID(req.session.passport.user.attendance_request);
                res.sendFile(Server.getViewsFile(req, res, Routes.ATTENDANCE_PAGE_DONE, "/", req.query.language ? req.query.language : undefined));
            }
        }

    } catch (err) {
        console.log(err);
        res.sendFile(Server.getApiViewsFile(req, res, Routes.ERROR_500, "/index.html"));
    }
};