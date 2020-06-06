const Auth = require('../../../auth/DiscordOauth'),
    Routes = require('../../../config/Routes');

module.exports = (req, res) => {
    Auth.logoutUser(req, res);
    res.redirect(req.query.redirectTo);
};