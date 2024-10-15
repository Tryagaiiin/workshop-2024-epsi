const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const badWords = require('./badWords.json');

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the users database.');
  });

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


client.on(Events.ClientReady, async (client) => {
    const guild = client.guilds.cache.get("1295322247376146495");
    console.log("fetching users");

    let res = await guild.members.fetch();
    res.forEach((member) => {
        db.get('SELECT * FROM users WHERE id = ?', [member.user.id], (err, row) => {
            if (err) {
                console.error('Error fetching user:', err.message);
                return;
            }
            if (!row) {
                console.log(`User ${member.user.id} not found in the database, creating...`);
                db.run('INSERT INTO users (id, username, score) VALUES (?, ?, ?)', [member.user.id, member.user.username, 0], (err) => {
                    if (err) {
                        console.error('Error adding user:', err.message);
                        return;
                    }
                    console.log(`User ${member.user.username} created successfully.`);
                });
            } else {
                console.log(`User ${member.user.username} already exists in the database.`);
            }
        });
    });
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

client.on('messageCreate', (message) => {
	if (message.author.bot) return;

	const content = message.content.toLowerCase();

	// Vérifier l'existence de l'utilisateur dans la base de données
	db.get('SELECT * FROM users WHERE id = ?', [`${message.author.id}`], (err, row) => {
		if (err) {
			// Création de l'utilisateur dans la base de données
			console.log(`user ${member.user.id} not found in the database`);
			db.run('INSERT INTO users(id, username, score) VALUES(?, ?, ?)', [`${member.user.id}`, `${member.user.username}`, 0], (err) => {
				if(err) {
					return console.log(err.message); 
				}
				console.log(`user created}`);
			})
		}
		else {
			// Ne rien faire si l'utilisateur existe déjà
		}
	});
  
	for (let word of badWords) {
	  if (content.includes(word)) {
		message.delete();
		message.channel.send(`${message.author}, votre message a été supprimé pour contenu inapproprié.`);
		// Incrémenter le score de l'utilisateur dans la base de données
		db.get('SELECT * FROM users WHERE id = ?', [`${message.author.id}`], (err, row) => {
			if (err) {
				return console.log(err.message);
			}
			if (row) {
				db.run('UPDATE users SET score = ? WHERE id = ?', [row.score + 1, `${message.author.id}`], (err) => {
					if (err) {
						return console.log(err.message);
					}
					console.log(`Score incremented for user ${message.author.id}`);
				});
			}
		});
		return;
	  }
	}
  
	// Autres traitements si nécessaires
  });

client.login(token);