const Auth = require('../../../auth/DiscordOauth'),
        RequestManager = require('../../../classes/managers/RequestManager');

module.exports = async (req, res, client, sequelize) => {
    if(!req.get("Access_token")) { //Check if there is an acess_token
        res.status(401).send("Unauthorized"); //Send the response status
        return;
    }
    const manager = new RequestManager(client, sequelize);
    const user = await Auth.getUserByAccessToken(res, req.get("Access_token")); //Fetch the user with the header "Access_token"
    if(!user.id) { //Check if there is an user and an attendance request
        res.status(404).json({error: "Unknown User"})
        return;
    }
    const request = await manager.getRequestByAuthorID(user.id); //Fetch the attendance request with the user id
    if(!request) { //Check if there is an user and an attendance request
        res.send(user);
        return;
    }
    res.send(Object.assign(user, {requestID: request.getId()}));
};