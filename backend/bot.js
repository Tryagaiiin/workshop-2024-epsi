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
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
  await sequelize.sync({ alter: true });
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    // Vérifier si le message est une commande
    if (message.content.startsWith('!redeem')) {
      const args = message.content.split(' ');
      if (args[1] === 'infraction') {
        await redeemInfraction(message.author.id, message);
      } else if (args[1] === 'kick') {
        await redeemKick(message.author.id, message);
      } else {
        message.channel.send('Usage : `!redeem infraction` ou `!redeem kick`');
      }
      return;
    }

    // Vérifier si le bot a la permission de gérer les messages
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
    await addPoints(message.author.id, 100000, message.author.username, message.author.avatar);
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
    user = await UserStat.create({ userId, username, avatar, infractions: 1 });
  } else {
    user.infractions += 1;
    user.points -= 5; // Déduire 5 points par infraction
    if (user.points < 0) user.points = 0;
    user.username = username;
    user.avatar = avatar;
    await user.save();
  }
  await checkPunishments(userId);
}

async function checkPunishments(userId) {
  let user = await UserStat.findByPk(userId);
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  const member = guild.members.cache.get(userId);

  if (!member) {
    console.error('Membre non trouvé sur le serveur.');
    return;
  }

  // Vérifier les permissions du bot
  if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    console.error('Le bot n\'a pas les permissions nécessaires.');
    return;
  }

  // Gérer les sanctions
  if (user.infractions % 10 === 0 && user.infractions !== 0) {
    // Kick temporaire
    const kickDuration = 24 * 60 * 60 * 1000; // 24 heures
    await kickUser(member, kickDuration);

    // Incrémenter le nombre de kicks
    user.kicks += 1;
    user.kickUntil = new Date(Date.now() + kickDuration);

    // Réduire les infractions de moitié
    user.infractions = Math.floor(user.infractions / 2);
    await user.save();

    // Le retour de l'utilisateur est manuel après un kick

    // Vérifier le nombre de kicks pour un ban définitif
    if (user.kicks >= 5) {
      // Bannir l'utilisateur
      try {
        await member.ban({ reason: 'Trop de kicks (5)' });
        console.log(`L'utilisateur ${member.user.tag} a été banni définitivement.`);
      } catch (error) {
        console.error('Erreur lors du bannissement de l\'utilisateur :', error);
      }
    }
  } else {
    // Mute temporaire
    const muteDuration = 10 * 60 * 1000; // 10 minutes

    // Vérifier si l'utilisateur est déjà mute
    if (user.muteUntil && user.muteUntil > new Date()) {
      return;
    }

    await muteUser(member, muteDuration);

    // Mettre à jour la date de fin du mute
    user.muteUntil = new Date(Date.now() + muteDuration);
    await user.save();

    // Retirer le rôle Muted après la durée spécifiée
    setTimeout(async () => {
      await member.roles.remove(guild.roles.cache.find(role => role.name === 'Muted'));
      console.log(`L'utilisateur ${member.user.tag} n'est plus mute.`);
      user.muteUntil = null;
      await user.save();
    }, muteDuration);
  }
}

async function muteUser(member, duration) {
  try {
    let muteRole = member.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) {
      // Créer le rôle Muted s'il n'existe pas
      muteRole = await member.guild.roles.create({
        name: 'Muted',
        color: '#818386',
        permissions: []
      });

      // Empêcher les membres avec le rôle Muted d'envoyer des messages dans tous les canaux
      for (const channel of member.guild.channels.cache.values()) {
        await channel.permissionOverwrites.edit(muteRole, {
          SendMessages: false,
          AddReactions: false,
          Speak: false
        });
      }
    }
    await member.roles.add(muteRole);
    console.log(`L'utilisateur ${member.user.tag} a été mute pour ${duration / 60000} minutes.`);
  } catch (error) {
    console.error('Erreur lors du mute de l\'utilisateur :', error);
  }
}

async function kickUser(member, duration) {
  try {
    await member.kick('Trop d\'infractions.');
    console.log(`L'utilisateur ${member.user.tag} a été kick pour ${duration / 3600000} heures.`);
    // Optionnel : Envoyer un message privé à l'utilisateur pour l'informer
    await member.send(`Vous avez été kick du serveur ${member.guild.name} pour une durée de 24 heures.`);
  } catch (error) {
    console.error('Erreur lors du kick de l\'utilisateur :', error);
  }
}

async function redeemInfraction(userId, message) {
  let user = await UserStat.findByPk(userId);
  if (user.points >= 100 && user.infractions > 0) {
    user.points -= 100;
    user.infractions -= 1;
    await user.save();
    message.channel.send('Vous avez échangé 100 points pour supprimer 1 infraction.');
  } else {
    message.channel.send('Vous n\'avez pas assez de points ou aucune infraction à supprimer.');
  }
}

async function redeemKick(userId, message) {
  let user = await UserStat.findByPk(userId);
  if (user.points >= 500 && user.kicks > 0) {
    user.points -= 500;
    user.kicks -= 1;
    await user.save();
    message.channel.send('Vous avez échangé 500 points pour supprimer 1 kick.');
  } else {
    message.channel.send('Vous n\'avez pas assez de points ou aucun kick à supprimer.');
  }
}

client.login(process.env.DISCORD_TOKEN);
