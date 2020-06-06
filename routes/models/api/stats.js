module.exports = async (req, res, client, sequelize) => {
    let [usersQuery] = await sequelize.query(`SELECT count(*) AS users FROM users`, { raw: true});
    res.send(`{
        "guilds": "${client.guilds.cache.size}",
        "users": "${usersQuery[0].users}" 
    }`)
};