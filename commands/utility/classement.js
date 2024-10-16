const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const { EmbedBuilder } = require('discord.js');

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
        });

        db.all('SELECT * FROM users ORDER BY score DESC LIMIT 10', [], (err, rows) => {
            if (err) {
                return console.error(err.message);
            }
            if (rows) {
                let embed = new EmbedBuilder()
                    .setTitle('Les plus toxiques')
                    .setColor(0x0099FF);
                
                    let leaderboard = ""; // Variable pour accumuler les utilisateurs et leurs scores

                    rows.forEach((row, index) => {
                        leaderboard += `\`${`#${index + 1}`.padEnd(3)} - ${row.username.padEnd(15)} | Score: ${row.score}\`\n`;
                    });
                                     
            
                    // Ajouter le contenu complet comme un seul champ
                    embed.addFields({ name: 'Classement', value: leaderboard, inline: false });
                
                return interaction.reply({ embeds: [embed] });
            }
            return interaction.reply('Il n\'y a pas encore de classement.');
        }
        );
    }
};