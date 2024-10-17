const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, Events, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { token } = require('./config.json');
const { guildId } = require('./config.json');
const { puniRoleId } = require('./config.json');
const { gentilRoleId } = require('./config.json');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
      console.error(err.message);
    }
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

	    // Connexion à la base de données SQLite3
		const db = new sqlite3.Database('./db/users.db', sqlite3.OPEN_READONLY, (err) => {
			if (err) {
				console.error('Erreur lors de la connexion à la base de données', err);
				return;
			}
		});
	
		// Fonction pour générer et envoyer le graphique
		const sendGraph = async () => {
			// Récupération du canal
			const channel = client.channels.cache.find(channel => channel.name === 'classement');
			if (!channel) {
				console.error('Le canal "classement" est introuvable');
				return;
			}
	
			// Suppression de tous les messages du canal
			const messages = await channel.messages.fetch({ limit: 100 }); // Récupérer les 100 derniers messages
			await channel.bulkDelete(messages)
				.catch(err => console.error('Erreur lors de la suppression des messages:', err));
	
			// Requête pour récupérer les données
			db.all(`SELECT username, score FROM users WHERE score > 0 ORDER BY score DESC LIMIT 5;'`, async (err, rows) => {
				if (err) {
					console.error('Erreur lors de la récupération des données:', err);
					return;
				}	
				// Création du graphique
				const width = 800; // Largeur du graphique
				const height = 600; // Hauteur du graphique
				const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
	
				const users = rows.map(row => row.username);
				const scores = rows.map(row => row.score);
	
				// Trouver l'utilisateur avec le compteur le plus élevé
				const maxCompteurIndex = scores.indexOf(Math.max(...scores));
				const userMax = users[maxCompteurIndex];
	
				const configuration = {
					type: 'bar',
					data: {
						labels: users,
						datasets: [{
							label: 'Compteurs des utilisateurs',
							data: scores,
							backgroundColor: '#7289DA', // Couleur similaire au logo Discord
							borderColor: '#4B5563',
							borderWidth: 1
						}]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: {
								display: false // Légende masquée
							},
							tooltip: {
								backgroundColor: 'rgba(255, 255, 255, 0.9)', // Arrière-plan des info-bulles
								titleColor: 'black', // Couleur du titre dans l'info-bulle
								bodyColor: 'black', // Couleur du texte du corps de l'info-bulle
								borderColor: 'black', // Bordure de l'info-bulle
								borderWidth: 1
							}
						},
						scales: {
							x: {
								grid: {
									display: false // Pas de quadrillage sur l'axe X
								},
								ticks: {
									color: 'white', // Couleur des étiquettes de l'axe X
									font: {
										size: 32 // Taille de la police de l'axe X augmentée
									}
								}
							},
							y: {
								beginAtZero: true,
								grid: {
									color: 'rgba(255, 255, 255, 0.2)', // Couleur des traits horizontaux
									drawBorder: false // Pas de bordure pour l'axe Y
								},
								ticks: {
									color: 'white', // Couleur des étiquettes de l'axe Y
									font: {
										size: 32 // Taille de la police de l'axe Y augmentée
									}
								}
							}
						},
						layout: {
							padding: {
								left: 10,
								right: 10,
								top: 10,
								bottom: 10
							}
						}
					}
				};
	
				const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration, 'image/png', { backgroundColor: 'rgba(0, 0, 0, 1)' }); // Arrière-plan noir opaque
	
				// Envoi du message de titre dans le canal Discord
				await channel.send('# 📊 Classement des utilisateurs les plus toxiques');
	
				// Envoi du graphique
				const attachment = new AttachmentBuilder(imageBuffer, { name: 'classement.png' });
				await channel.send({ files: [attachment] });
				console.log('Graphique envoyé avec succès.');
	
				// Tagger l'utilisateur le plus toxique
				const guild = channel.guild;
				await guild.members.fetch(); // Récupérer tous les membres du serveur
				const utilisateurLePlusToxique = guild.members.cache.find(member => member.user.username === userMax);
				if (utilisateurLePlusToxique) {
					await channel.send(`# 🦠 L'utilisateur le plus toxique est : <@${utilisateurLePlusToxique.id}>`);
				} else {
					await channel.send(`# 🦠 L'utilisateur le plus toxique est : ${userMax} (utilisateur introuvable)`);
				}
			});
		};
	
		// Envoi du graphique toutes les 5 secondes pour le test
		setInterval(sendGraph, 60000);
	});


client.on(Events.ClientReady, async (client) => {
    const guild = client.guilds.cache.get(guildId);
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
					member.roles.add(gentilRoleId);
                });
            } else {
                console.log(`User ${member.user.username} already exists in the database.`);
				// Ajouter le role gentil si le score est inférieur à 10
				if (row.score < 10) {
					member.roles.add(gentilRoleId);
				}
				// Ajouter le role puni si le score est supérieur à 10
				if (row.score > 9) {
					member.roles.add(puniRoleId);
				}
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

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    const filePath = path.join(__dirname, 'badWords.json');

    // Lire le fichier JSON à chaque fois
    let badWords;
    try {
        const data = fs.readFileSync(filePath); // Lire le fichier avec le bon encodage
        badWords = JSON.parse(data); // Parser le JSON
    } catch (err) {
        console.error('Erreur lors de la lecture de badWords.json:', err);
        return; // Quitter si erreur
    }

	// Vérifier l'existence de l'utilisateur dans la base de données
	db.get('SELECT * FROM users WHERE id = ?', [`${message.author.id}`], (err, row) => {
		if (err) {
			// Création de l'utilisateur dans la base de données
			console.log(`user ${member.user.id} not found in the database`);
			db.run('INSERT INTO users(id, username, score) VALUES(?, ?, ?)', [`${member.user.id}`, `${member.user.username}`, 0], (err) => {
				if(err) {
					return console.log(err.message); 
				}
				console.log(`user created`);
				// Ajouter le rôle gentil à l'utilisateur
				member.roles.add(gentilRoleId);
			})
		}
		else {
			// Ne rien faire si l'utilisateur existe déjà
		}
	});
  
    for (let word of badWords) {
		let wordsInContent = content.split(/\b/);

        if (wordsInContent.includes(word)) {
            try {
                await message.delete();
                console.log(`Message de ${message.author.username} supprimé : ${message.content}`);
                await message.channel.send(`${message.author}, votre message a été supprimé pour contenu inapproprié.`);
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
					console.log(`Score incremented for user ${message.author.username}`);
					// Ajouter le rôle puni à l'utilisateur si son score est supérieur à 9
					if (row.score >= 10) {
						const member = message.guild.members.cache.get(message.author.id);
						member.roles.add(puniRoleId);
						// Retirer le rôle gentil à l'utilisateur
						member.roles.remove(gentilRoleId);
						console.log(`Roles updated ${message.author.id}`);
					}
				});
			}
		});
            } catch (error) {
                if (error.code === 10008 || error.code === 10007) {
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