const Auth = require('../../../auth/DiscordOauth');

module.exports = (req, res) => {
    res.status(300).redirect(Auth.getOauthLink(req));
};