const routes = require('../../../config/Routes');

module.exports = async (req, res) => {
  res.json({route: routes[req.get("Route")]});
};