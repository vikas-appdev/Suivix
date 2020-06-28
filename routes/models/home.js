/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
const Routes = require("../../config/Routes"),
  Server = require("../../utils/Server");

module.exports = (req, res) => {
  const language = req.query.language ? req.query.language : req.params.language;
  if (language !== "fr" && language !== "en" && language !== undefined) {
    res.redirect(Routes.HOME_PAGE);
  } else {
    res.sendFile(
      Server.getViewsFile(req, res, Routes.HOME_PAGE, "home/", language)
    );
  }
};
