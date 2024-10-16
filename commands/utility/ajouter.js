const { SlashCommandBuilder } = require('discord.js');
const { ajoutRoleId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ajouter')
		.setDescription('Ajouter un mot à la liste des mots toxiques')
        .addStringOption(option =>
            option.setName('mot')
                .setDescription('Le mot à ajouter')
                .setRequired(true)),
	async execute(interaction) {
        // Check if the user has the required role to add a word
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(ajoutRoleId)) {
            return interaction.reply('Tu n\'as pas la permission d\'utiliser cette commande.');
        }
        
        // Get the word to add
        const word = interaction.options.getString('mot');

        // Append the word to the ../badwords.json file
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', '..', 'badWords.json'); 
        const data = fs.readFileSync(filePath);
        const words = JSON.parse(data);
        if (!words.includes(word)) {
            words.push(word);
            fs.writeFileSync(filePath, JSON.stringify(words));
            console.log(`interaction.user.username a ajouté le mot ${word}`);
            return interaction.reply(`Le mot ${word} a été ajouté à la liste des mots toxiques.`);
        }
        else {
            return interaction.reply(`Le mot ${word} est déjà dans la liste des mots toxiques.`);
        }
	},
};