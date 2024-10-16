const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const { resetRoleId } = require('../../config.json');
const { puniRoleId } = require('../../config.json');
const { gentilRoleId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Réinitialise le score de toxicité d\'un utilisateur')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('L\'utilisateur dont le score doit être réinitialisé')
                .setRequired(true)),
	async execute(interaction) {
        // Vérifier si l'utilisateur a la permission d'administrateur
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(resetRoleId)) {
            console.log(`interaction.user.username : pas les droits pour reset`);
            return interaction.reply('Tu n\'as pas la permission d\'utiliser cette commande.');
        }

        // Connect to the database and reset the user's score
        let db = new sqlite3.Database('./db/users.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the users database.');
        });
 
        const user = interaction.options.getUser('user');

        db.run('UPDATE users SET score = 0 WHERE id = ?', [user.id], (err) => {
            if (err) {
                return console.error(err.message);
            }
            // Supprimer le rôle puni de l'utilisateur
            const member = interaction.guild.members.cache.get(user.id);
            member.roles.remove(puniRoleId);

            // Ajouter le rôle gentil à l'utilisateur
            member.roles.add(gentilRoleId);

            console.log(`Roles updated ${user.id}`);

            return interaction.reply(`Le score de toxicité de <@${user.id}> a été réinitialisé.`);
        });
    }
};