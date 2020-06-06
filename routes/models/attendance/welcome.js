const Routes = require("../../../config/Routes"),
    Server = require('../../../utils/Server');

module.exports = (req, res) => {
    res.set("Access_token", req.cookies["access_token"]);
    res.sendFile(Server.getViewsFile(req, res, Routes.ATTENDANCE_PAGE, "/", req.query.language ? req.query.language : undefined));
};