/*
* Copyright (c) 2020, MΛX! Inc.  All rights reserved.
* Copyrights licensed under the GNU General Public License v3.0.
* See the accompanying LICENSE file for terms.
*/
var package = require('../../../package.json');

module.exports = (req, res) => {
    res.send(`{
        "version": "${package.version}",
        "en": "<strong>• The bot code source has been completely rewritten.</strong> <br> Lots of bug fixes and optimizations.<br><br><strong>• Added a quick attendance system </strong><br>  You can now take attendance on one page and much quicker.<br><br><strong>• Added a button to take attendance again </strong><br>  After taking attendance, you can now create a new attendance request on the same page.",
        "fr": "<strong>• Le code source du bot a été entièrement réécrit.</strong> <br> Beaucoup de bugs réglés et d'optimisations.<br><br><strong>• Ajout d'une fonction de suivi rapide </strong><br>  Vous pouvez désormais faire l'appel sur une seule page et beaucoup plus rapidement.<br><br><strong>• Ajout d'une fonction permettant de refaire un suivi </strong><br>  Après un suivi, vous pouvez en lancer un nouveau sans fermer votre navigateur."
    }`);
};