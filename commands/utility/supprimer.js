const { SlashCommandBuilder } = require('discord.js');
const { suppressionRoleId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('supprimer')
		.setDescription('Supprimer un mot de la liste des mots toxiques')
        .addStringOption(option =>
            option.setName('mot')
                .setDescription('Le mot à supprimer')
                .setRequired(true)),
	async execute(interaction) {
        // Check if the user has the required role to add a word
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(suppressionRoleId)) {
            return interaction.reply('Tu n\'as pas la permission d\'utiliser cette commande.');
        }

        // Get the word to remove
        const word = interaction.options.getString('mot');
        
        // Remove the word from the ../../badWords.json file
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', '..', 'badWords.json');
        const data = fs.readFileSync(filePath);
        const words = JSON.parse(data);

        if (words.includes(word)) {
            words.splice(words.indexOf(word), 1);
            fs.writeFileSync(filePath, JSON.stringify(words));
            return interaction.reply(`Le mot ${word} a été supprimé de la liste des mots toxiques.`);
        }
        else {
            return interaction.reply(`Le mot ${word} n'est pas dans la liste des mots toxiques.`);
        }
    }
};