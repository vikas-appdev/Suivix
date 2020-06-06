const Routes = require("../../config/Routes"),
    Server = require('../../utils/Server');

module.exports = (req, res, language) => {
    res.sendFile(Server.getViewsFile(req, res, Routes.HOME_PAGE, "home/", req.query.language ? req.query.language : language));
};