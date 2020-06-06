/*
* Copyright (c) 2020, MΛX! Inc.  All rights reserved.
* Copyrights licensed under the GNU General Public License v3.0.
* See the accompanying LICENSE file for terms.
*/
const routes = require('../../../config/Routes');

module.exports = async (req, res) => {
  res.json({route: routes[req.get("Route")]});
};