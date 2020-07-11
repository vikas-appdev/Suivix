/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Auth = require('../../../classes/auth/DiscordOauth'),
    RequestManager = require('../../../classes/managers/RequestManager');

module.exports = async(req, res) => {
    const user = await Auth.authUser(req, res, req.query.code);
    if (!user) {
        res.redirect(Routes.LOGIN_PAGE);
        return;
    };
    if (req.query.guild_id) {
        (new RequestManager()).createNewRequest(user, +new Date(), req.query.guild_id);
    } else {
        await manager.createRequestByOldOne(user.id);
    }
    res.redirect(Routes.ATTENDANCE_PAGE);
};