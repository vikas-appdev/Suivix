const Auth = require('../../../auth/DiscordOauth'),
    Routes = require('../../../config/Routes'),
    RequestManager = require('../../../classes/managers/RequestManager');

module.exports = async (req, res, client, sequelize) => {
    const manager = new RequestManager(client, sequelize);
    const user = await Auth.authUser(req, res, req.query.code);
    await manager.createRequestByOldOne(user.id);
    res.redirect(Routes.ATTENDANCE_PAGE);
};