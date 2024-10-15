const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
const badWords = require('./badWords.json');


client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
  
    for (let word of badWords) {
        if (content.includes(word)) {
            try {
                await message.delete();
                console.log(`Message supprimé : ${message.content}`);
                await message.channel.send(`${message.author}, votre message a été supprimé pour contenu inapproprié.`);
                // Enregistrer l'infraction dans la base de données ici
            } catch (error) {
                if (error.code === 10008) {
                    console.log("Le message a déjà été supprimé.");
                } else {
                    console.error("Erreur inattendue lors de la suppression du message :", error);
                }
            }
            return; // S'assurer de sortir de la boucle après le traitement d'un mot interdit
        }
    }
  
    // Autres traitements si nécessaires
});


client.login(token);