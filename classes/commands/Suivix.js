const Discord = require('discord.js'),
    Config = require('../../config/Config');

/**
 * Launch the command
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param args - Arguments typed by the user in addition to the command
 * @param client - The bot client 
 */
const suivixCommand = async function (message, args, client, sequelize) {
    const guild = message.guild;
    const channel = message.channel;

    let author = message.author;

    let [dbUser] = await sequelize.query(`SELECT * FROM users WHERE id = "${author.id}"`, { raw: true });
    if (!dbUser[0]) [dbUser] = await createUser(author, sequelize);

    const language = dbUser[0].language === "fr" ? "fr" : "en";
    sequelize.query(`DELETE FROM requests WHERE author = "${author.id}"`);
    sequelize.query(`INSERT INTO requests (id, author, date, guildID, channelID) VALUES ("${message.createdTimestamp}", "${author.id}", "${new Date()}", "${guild.id}", "${channel.id}")`);
    sequelize.query(`INSERT INTO history (id, author, date, guildID, channelID) VALUES ("${message.createdTimestamp}", "${author.id}", "${new Date()}", "${guild.id}", "${channel.id}")`);

    let msg;
    if (args.includes("help") || args.includes("aide")) {
        msg = language === "fr" ? await generateFrenchHelpMessage(channel, author) : await generateEnglishHelpMessage(channel, author);
    } else {
        msg = language === "fr" ? await generateFrenchMessage(channel, author) : await generateEnglishMessage(channel, author);
    }

    if(msg) {
        msg.react("🇫🇷");
        msg.react("🇬🇧");
    }
};

/**
 * Add a user in the database
 * @param {*} author - The command author
 */
async function createUser(author, sequelize) {
    console.log("-----------------------\nCreating a new user : " + author.username + "#" + author.discriminator);
    await sequelize.query(`INSERT INTO users (id, language) VALUES (${author.id}, "fr")`);
    return await sequelize.query(`SELECT * FROM users WHERE id = "${author.id}"`, { raw: true });
}

/**
 * Returns the english message for the suivix command
 * @param {*} channel - The channel where the command was trigerred
 */
const generateEnglishMessage = async function (channel, author) {
    return await channel.send(new Discord.MessageEmbed().setDescription(`Go to ${getProtocol()}://${Config.WEBSITE_HOST}/attendance?language=en to take attendance.\n\nNotes :\n• Help is available by typing \`!suivix help\`.\n• Official Website : https://www.suivix.xyz/en\n• Suivix Support Server : https://discord.gg/xRNEzGM.\n\n**Changez de langue en utilisant les réactions sous ce message.**`)
        .setImage("https://i.imgur.com/QbiPChv.png")
        .setFooter("You will be redirected to the secure website of suivix (https)")
        .setTitle("Attendance Request")).catch((err) => {
            console.log("Error while sending message");
            author.send(":x: | An error occured while sending the message.\nPlease verify suivix permissions.")
        });
}

/**
 * Returns the french message for the suivix command
 * @param {*} channel - The channel where the command was trigerred
 */
const generateFrenchMessage = async function (channel, author) {
    return await channel.send(new Discord.MessageEmbed().setDescription(`Rendez-vous à l'adresse suivante ${getProtocol()}://${Config.WEBSITE_HOST}/attendance?language=fr pour effectuer votre suivi visuel.\n\nNotes :\n• Une aide est disponible. Tapez \`!suivix aide\`.\n• Site Internet Officiel : https://www.suivix.xyz\n• Server Discord de Support : https://discord.gg/xRNEzGM.\n\n**Change language by using reactions under this message.**`)
        .setImage("https://i.imgur.com/QbiPChv.png")
        .setFooter("Vous allez être redirigé vers le site web sécurisé de suivix (https)")
        .setTitle("Demande de suivi")).catch((err) => {
            console.log("Error while sending message");
            author.send(":x: | Une erreur est survenue au moment d'envoyer le message.\nVeuillez vérifier les permissions du bot dans le salon où vous effectuez le suivi.")
        });
}

/**
 * Returns the english help message for the suivix command
 * @param {*} channel - The channel where the command was trigerred
 */
const generateEnglishHelpMessage = async function (channel, author) {
    return await channel.send("For more information or assistance, please visit https://discord.gg/xRNEzGM.", {
        embed: new Discord.MessageEmbed().setDescription(`Suivix includes 1 command and a website:\n\`\`\`• !suivix\n• https://suivix.xyz (Official Website)\`\`\`` +
            `\nUsages :\n-\n\`!suivix <aide or help>\`\n• Creates an online attendance request\n(Add option "aide" or "help" will display this page)\n` +
            "\n:warning: You must not put \`<\` and \`>\` in the command synthax. **Options are optional.**\n-\nChangez de langue en utilisant les réactions sous ce message.")
            .setThumbnail("https://i.imgur.com/8qCFYLj.png")
            .setTitle("Request for assistance")
            .setFooter("2020 - Suivix | All rights reserved | Made with ❤️ by MΛX#2231")
    }).catch((err) => {
        console.log("Error while sending message");
        author.send(":x: | An error occured while sending the message.\nPlease verify suivix permissions.")
    });
}

/**
 * Returns the french help message for the suivix command
 * @param {*} channel - The channel where the command was trigerred
 */
const generateFrenchHelpMessage = async function (channel, author) {
    return await channel.send("Pour toute information ou aide supplémentaire, rendez-vous sur https://discord.gg/xRNEzGM.", {
        embed: new Discord.MessageEmbed().setDescription(`Suivix comporte deux commandes et un site internet :\n\`\`\`• !suivix\n• !suivixcmd\n• https://suivix.xyz (Site Internet Officiel)\`\`\`` +
            `\nUtilisations :\n-\n\`!suivix <aide ou help>\`\n• Crée une demande de suivi visuel en ligne\n(Ajouter l'option "aide" ou "help" vous affichera cette page)\n-\n\`!suivixcmd <numéro du salon> <numéro du rôle>\`\n• Crée une demande de suivi directement sur Discord\n(Ces deux options vous permettent d'effectuer votre suivi sans passer par toutes les étapes)` +
            "\n\n:warning: Vous ne devez pas mettre \`<\` et \`>\` dans la syntaxe de votre commande. **Les options sont facultatives.**\n-\nChange language by using reactions under this message.")
            .setThumbnail("https://i.imgur.com/8qCFYLj.png")
            .setTitle("Demande d'aide")
            .setFooter("2020 - Suivix | All rights reserved | Made with ❤️ by MΛX#2231")
    }).catch((err) => {
        console.log("Error while sending message");
        author.send(":x: | Une erreur est survenue au moment d'envoyer le message.\nVeuillez vérifier les permissions du bot dans le salon où vous effectuez le suivi.")
    });
}

const getProtocol = function () {
    return Config.HTTPS_ENABLED === "true" ? "https" : "http";
}

module.exports.suivixCommand = suivixCommand;