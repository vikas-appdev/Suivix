/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Auth = require('../../../classes/auth/DiscordOauth');

module.exports = async (req, res) => {
    if (!req.get("Access_token")) { //Check if there is an acess_token
        res.status(401).send("Unauthorized"); //Send the response status
        return;
    }
    const user = await Auth.getUserByAccessToken(res, req.get("Access_token")); //Fetch the user with the header "Access_token"
    if (!user.id) { //Check if there is an user
        res.status(404).json({
            error: "Unknown User"
        })
    } else {
        res.send(await Auth.getUserGuilds(req.get("Access_token")));
    }
};