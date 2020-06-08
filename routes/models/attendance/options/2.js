/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Routes = require("../../../../config/Routes"),
    Server = require('../../../../utils/Server');

module.exports = (req, res) => {
    res.sendFile(Server.getViewsFile(req, res, Routes.ATTENDANCE_PAGE_OPTION_2, "/", req.query.language ? req.query.language : undefined));
};