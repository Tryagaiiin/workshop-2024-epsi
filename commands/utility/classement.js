const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('classement')
		.setDescription('Affiche le classement des utilisateurs toxiques'),
	async execute(interaction) {
        // Connect to the database and retrieve the user's score
        let db = new sqlite3.Database('./db/users.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the users database.');
        });

        db.get('SELECT score FROM users WHERE id = ?', [`${interaction.user.id}`], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (row) {
                return interaction.reply(`Ton score de toxicité est de ${row.score}`);
            }
            return interaction.reply('Tu n\'as pas encore de score de toxicité.');
        }
        );
	},
};