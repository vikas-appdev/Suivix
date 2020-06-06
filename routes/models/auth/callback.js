const Auth = require('../../../auth/DiscordOauth'),
    Routes = require('../../../config/Routes'),
    RequestManager = require('../../../classes/managers/RequestManager');

module.exports = async (req, res, client, sequelize) => {
    const manager = new RequestManager(client, sequelize);
    const user = await Auth.authUser(req, res, req.query.code);
    if(!user) return;
    const request = await manager.getRequestByAuthorID(user.id);
    if(!request || request.isExpired()) {
        res.redirect(Routes.ATTENDANCE_NOREQUEST);
        return;
    }
    res.cookie('access_token', user.access_token, {
        maxAge: 60000, // Lifetime
    })
    res.redirect(Routes.ATTENDANCE_PAGE);
};
    