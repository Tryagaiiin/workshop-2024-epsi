require('dotenv').config();
const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const sequelize = require('./database');
const UserStat = require('./models/UserStat');
const badWords = require('./badWords.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
  await sequelize.sync();
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    // Vérifier si le bot a la permission de supprimer des messages
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      console.error('Le bot n\'a pas la permission de gérer les messages.');
      return;
    }

    // Filtrage des messages texte
    const content = message.content.toLowerCase();

    for (let word of badWords) {
      if (content.includes(word)) {
        try {
          await message.delete();
          await message.channel.send(`${message.author}, votre message a été supprimé pour contenu inapproprié.`);
        } catch (err) {
          console.error('Erreur lors de la suppression du message :', err);
        }
        await addInfraction(message.author.id, message.author.username, message.author.avatar);
        return;
      }
    }

    // Ajouter des points pour participation
    await addPoints(message.author.id, 1, message.author.username, message.author.avatar);
  } catch (error) {
    console.error('Une erreur s\'est produite dans messageCreate:', error);
  }
});

async function addPoints(userId, amount, username, avatar) {
  let user = await UserStat.findByPk(userId);
  if (!user) {
    user = await UserStat.create({ userId, username, avatar, points: amount });
  } else {
    user.points += amount;
    user.username = username;
    user.avatar = avatar;
    await user.save();
  }
}

async function addInfraction(userId, username, avatar) {
  let user = await UserStat.findByPk(userId);
  if (!user) {
    user = await UserStat.create({ userId, username, avatar, infractions: 1, points: 0 });
  } else {
    user.infractions += 1;
    user.points -= 5; // Déduire 5 points par infraction
    if (user.points < 0) user.points = 0; // Empêcher les points négatifs
    user.username = username;
    user.avatar = avatar;
    await user.save();
  }
  await checkPunishments(userId);
}


async function checkPunishments(userId) {
  let user = await UserStat.findByPk(userId);
  if (user.infractions >= 50) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const member = guild.members.cache.get(userId);
    if (member) {
      await member.ban({ reason: 'Trop d\'infractions.' });
    }
  }
}

client.login(process.env.DISCORD_TOKEN);
