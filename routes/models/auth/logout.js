/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
module.exports = (req, res) => {
    let user = req.session.passport.user.identity;
    console.log('{username}#{discriminator}'.formatUnicorn({
        username: user.username,
        discriminator: user.discriminator
    }).yellow + " logged out on ".blue + new Date().toString().yellow + ".".blue + separator);
    req.session.destroy();
    res.redirect(req.query.redirectTo);
};