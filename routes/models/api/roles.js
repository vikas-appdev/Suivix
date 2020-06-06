const RequestManager = require('../../../classes/managers/RequestManager');

module.exports = async (req, res, client, sequelize) => {
    const manager = new RequestManager(client, sequelize);
    const request = await manager.getRequestByID(req.get("RequestID"));
    if(!request) {
        res.status(404).json("Request does not exists")
    } else {
        res.json(request.getRoles());
    }
};