require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const cors = require('cors');
const sequelize = require('./database');
const UserStat = require('./models/UserStat');
const secret = crypto.randomBytes(64).toString('hex');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json()); // Pour parser les requêtes JSON

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ['identify', 'guilds'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Enregistrez ou mettez à jour l'utilisateur dans la base de données
    let user = await UserStat.findByPk(profile.id);
    if (!user) {
      user = await UserStat.create({
        userId: profile.id,
        username: profile.username,
        avatar: profile.avatar,
      });
    } else {
      user.username = profile.username;
      user.avatar = profile.avatar;
      await user.save();
    }
    return done(null, profile);
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'utilisateur :', err);
    return done(err, null);
  }
}));

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('http://localhost:3000/dashboard');
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).send('Non autorisé');
  }
});

app.get('/api/stats', async (req, res) => {
  if (req.isAuthenticated()) {
    const userStat = await UserStat.findByPk(req.user.id);
    res.json(userStat);
  } else {
    res.status(401).send('Non autorisé');
  }
});

app.get('/api/leaderboard', async (req, res) => {
  const leaderboard = await UserStat.findAll();
  res.json(leaderboard);
});

// Routes pour échanger des points contre des infractions ou des kicks
app.post('/api/redeem/infraction', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = await UserStat.findByPk(req.user.id);
    if (user.points >= 100 && user.infractions > 0) {
      user.points -= 100;
      user.infractions -= 1;
      await user.save();
      res.json({ message: 'Vous avez échangé 100 points pour supprimer 1 infraction.', stats: user });
    } else {
      res.status(400).json({ message: 'Vous n\'avez pas assez de points ou aucune infraction à supprimer.' });
    }
  } else {
    res.status(401).send('Non autorisé');
  }
});

app.post('/api/redeem/kick', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = await UserStat.findByPk(req.user.id);
    if (user.points >= 500 && user.kicks > 0) {
      user.points -= 500;
      user.kicks -= 1;
      await user.save();
      res.json({ message: 'Vous avez échangé 500 points pour supprimer 1 kick.', stats: user });
    } else {
      res.status(400).json({ message: 'Vous n\'avez pas assez de points ou aucun kick à supprimer.' });
    }
  } else {
    res.status(401).send('Non autorisé');
  }
});

// Synchroniser les modèles avec la base de données avant de démarrer le serveur
sequelize.sync().then(() => {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Serveur backend démarré sur le port ${PORT}`);
  });
}).catch((err) => {
  console.error('Impossible de synchroniser les modèles avec la base de données :', err);
});
