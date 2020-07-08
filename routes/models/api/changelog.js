/*
 * Copyright (c) 2020, MΛX! Inc.  All rights reserved.
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */
var package = require('../../../package.json');

module.exports = (req, res) => {
    res.send(`{
        "version": "${package.version}",
        "en": "<strong>• You can now take attendance by directly going at <a href='https://suivix.xyz/attendance'>https://suivix.xyz/attendance</a>. (Discord command no longer needed)</strong><br><br>If you encounter a bug, or you think something is broken, please contact me on Discord:<br><br>MΛX#2231",
        "fr": "<strong>• Vous pouvez désormais faire l'appel en allant directement sur <a href='https://suivix.xyz/attendance'>https://suivix.xyz/attendance</a>. (Vous n'avez plus besoin d'utiliser la commande sur discord.)</strong><br>- Vous pouvez désormais sélectionner plusieurs roles et salons lors de votre appel.<br><br>Si vous rencontrez un bug, ou pensez que quelque chose ne marche pas bien, merci de me contacter sur Discord :<br><br>MΛX#2231"
    }`);
};