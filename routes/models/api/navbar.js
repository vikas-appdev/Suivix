const Routes = require("../../../config/Routes"),
    Server = require('../../../utils/Server');

module.exports = (req, res) => {
    res.sendFile(Server.getApiViewsFile(req, res, Routes.API_NAVBAR_URL, "/index.html"));
};