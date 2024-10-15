# Projet Discord Bot avec Dashboard

Ce projet consiste en un bot Discord associé à un tableau de bord web (frontend React) et un serveur backend (Express.js) pour gérer les statistiques des utilisateurs, les infractions, le classement, etc.

## **Table des matières**

- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
  - [1. Cloner le dépôt](#1-cloner-le-dépôt)
  - [2. Configuration des variables d'environnement](#2-configuration-des-variables-denvironnement)
  - [3. Installation des dépendances](#3-installation-des-dépendances)
- [Lancement du projet](#lancement-du-projet)
  - [1. Démarrer le serveur backend](#1-démarrer-le-serveur-backend)
  - [2. Démarrer le bot Discord](#2-démarrer-le-bot-discord)
  - [3. Démarrer le client frontend](#3-démarrer-le-client-frontend)
- [Utilisation](#utilisation)
- [Dépendances](#dépendances)
- [Exemple de commandes](#exemple-de-commandes)
- [Notes importantes](#notes-importantes)

---

## **Structure du projet**

Le projet est structuré en trois parties principales :

- **backend** : Contient le serveur Express.js pour l'API et l'authentification avec Discord.
- **bot** : Contient le code du bot Discord.
- **client** : Contient l'application frontend React pour le tableau de bord et le classement.

**Arborescence :**

```
projet/
├── backend/
│   ├── app.js
│   ├── database.js
│   ├── models/
│   │   └── UserStat.js
│   ├── .env
│   └── package.json
├── bot/
│   ├── bot.js
│   ├── database.js
│   ├── models/
│   │   └── UserStat.js
│   ├── badWords.json
│   ├── .env
│   └── package.json
└── client/
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   ├── api.js
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── Dashboard.js
    │   │   ├── Leaderboard.js
    │   │   └── StatsChart.js
    │   └── index.css
    ├── .env
    └── package.json
```

---

## **Prérequis**

- **Node.js** (version 14 ou supérieure)
- **npm** (généralement installé avec Node.js)
- **Git** (pour cloner le dépôt, optionnel)
- Un compte **Discord** avec un serveur où vous avez les permissions administrateur
- Une **application Discord** avec un bot, créée via le [Portail des développeurs Discord](https://discord.com/developers/applications)

---

## **Installation**

### **1. Cloner le dépôt**

```bash
git clone https://github.com/votre-utilisateur/votre-repo.git
cd votre-repo
```

### **2. Configuration des variables d'environnement**

#### **2.1. Créer les fichiers `.env`**

Vous devez créer des fichiers `.env` dans les dossiers `backend`, `bot`, et éventuellement `client` si nécessaire.

##### **Backend (`backend/.env`):**

```env
# backend/.env
CLIENT_ID=Votre_Application_ID
CLIENT_SECRET=Votre_Client_Secret
CALLBACK_URL=http://localhost:5000/auth/discord/callback
SESSION_SECRET=Votre_Secret_De_Session
PORT=5000
GUILD_ID=Votre_Guild_ID
```

##### **Bot (`bot/.env`):**

```env
# bot/.env
DISCORD_TOKEN=Votre_Token_Bot
GUILD_ID=Votre_Guild_ID
```

- **CLIENT_ID** : L'ID de votre application Discord.
- **CLIENT_SECRET** : Le secret client de votre application Discord.
- **CALLBACK_URL** : L'URL de rappel pour l'authentification OAuth2 avec Discord.
- **SESSION_SECRET** : Une chaîne aléatoire pour sécuriser les sessions (générez-la avec `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`).
- **PORT** : Le port sur lequel votre serveur backend écoutera (5000 par défaut).
- **GUILD_ID** : L'ID de votre serveur Discord.
- **DISCORD_TOKEN** : Le token de votre bot Discord.

#### **2.2. Obtenir les identifiants Discord**

- **Créer une application Discord** via le [Portail des développeurs Discord](https://discord.com/developers/applications).
- **Récupérer l'ID de l'application** (CLIENT_ID).
- **Créer un bot dans votre application** et récupérer le **Token du bot** (DISCORD_TOKEN).
- **Récupérer le Client Secret** de votre application (CLIENT_SECRET).
- **Configurer l'URL de rappel (Redirect URI)** dans l'onglet OAuth2 de votre application :
  - Ajoutez `http://localhost:5000/auth/discord/callback` comme Redirect URI.

#### **2.3. Inviter le bot sur votre serveur**

- **Générer un lien d'invitation** avec les permissions nécessaires en utilisant l'URL suivante :

  ```
  https://discord.com/oauth2/authorize?client_id=VOTRE_CLIENT_ID&scope=bot&permissions=268443702
  ```

  - Remplacez `VOTRE_CLIENT_ID` par l'ID de votre application.
  - Les permissions peuvent être ajustées selon vos besoins.

- **Invitez le bot** sur votre serveur en utilisant le lien généré.

### **3. Installation des dépendances**

#### **3.1. Installer les dépendances du backend**

```bash
cd backend
npm install
```

#### **3.2. Installer les dépendances du bot**

```bash
cd ../bot
npm install
```

#### **3.3. Installer les dépendances du client**

```bash
cd ../client
npm install
```

---

## **Lancement du projet**

### **1. Démarrer le serveur backend**

Ouvrez un terminal et naviguez vers le répertoire `backend` :

```bash
cd backend
node app.js
```

Vous devriez voir :

```
Serveur backend démarré sur le port 5000
```

### **2. Démarrer le bot Discord**

Dans un autre terminal, naviguez vers le répertoire `bot` :

```bash
cd bot
node bot.js
```

Vous devriez voir :

```
Connecté en tant que VotreBot#1234!
```

### **3. Démarrer le client frontend**

Dans un troisième terminal, naviguez vers le répertoire `client` :

```bash
cd client
npm start
```

L'application React devrait se lancer et être accessible à l'adresse `http://localhost:3000`.

---

## **Utilisation**

- **Accédez à l'application frontend** en ouvrant votre navigateur à l'adresse `http://localhost:3000`.
- **Cliquez sur "Se connecter"** pour vous authentifier via Discord.
- **Autorisez l'application** si c'est la première fois que vous vous connectez.
- **Vous serez redirigé vers le tableau de bord**, où vous pourrez voir vos statistiques.
- **Interagissez avec le bot sur votre serveur Discord** en envoyant des messages.
  - **Envoyez des messages normaux** pour gagner des points.
  - **Envoyez des messages contenant des mots interdits** pour tester le système d'infractions.

---

## **Dépendances**

### **Backend**

- express
- express-session
- passport
- passport-discord
- dotenv
- sequelize
- sqlite3
- cors
- crypto

### **Bot**

- discord.js
- dotenv
- sequelize
- sqlite3

### **Client**

- react
- react-dom
- react-router-dom
- axios
- bootstrap
- @fortawesome/fontawesome-free
- react-chartjs-2
- chart.js
- framer-motion

---

## **Exemple de commandes**

### **Cloner le dépôt**

```bash
git clone https://github.com/votre-utilisateur/votre-repo.git
cd votre-repo
```

### **Installer les dépendances**

```bash
# Backend
cd backend
npm install

# Bot
cd ../bot
npm install

# Client
cd ../client
npm install
```

### **Démarrer les services**

#### **Backend**

```bash
cd backend
node app.js
```

#### **Bot**

```bash
cd bot
node bot.js
```

#### **Client**

```bash
cd client
npm start
```

---

## **Notes importantes**

- **Base de données** : Le projet utilise une base de données SQLite (`database.sqlite`) pour stocker les données des utilisateurs.
  - **Emplacement** : Le fichier `database.sqlite` sera créé dans le répertoire `backend` et `bot` selon la configuration.
  - **Synchronisation des modèles** : Les modèles Sequelize sont synchronisés avec la base de données lors du démarrage du serveur et du bot.

- **Gestion des variables d'environnement** : Assurez-vous que les fichiers `.env` sont correctement configurés et que les valeurs sont exactes.

- **Permissions du bot** : Le bot doit avoir les permissions nécessaires sur votre serveur Discord pour fonctionner correctement :
  - **Lire les messages**
  - **Envoyer des messages**
  - **Gérer les messages**
  - **Bannir des membres** (si vous utilisez la fonctionnalité de bannissement)

- **Intents du bot** : Assurez-vous que les intents nécessaires sont activés dans le [Portail des développeurs Discord](https://discord.com/developers/applications) pour votre bot :
  - **PRESENCE INTENT** : Non requis dans ce projet.
  - **SERVER MEMBERS INTENT** : Peut être nécessaire si vous gérez les membres.
  - **MESSAGE CONTENT INTENT** : Doit être activé pour que le bot puisse lire le contenu des messages.

- **Bad Words** : Le fichier `badWords.json` contient la liste des mots interdits que le bot filtrera.
  - **Emplacement** : `bot/badWords.json`
  - **Format** : Une liste de mots ou expressions à filtrer.

- **Modification des modèles** :
  - Si vous modifiez les modèles Sequelize, assurez-vous de synchroniser à nouveau la base de données.
  - **Attention** : L'utilisation de `sequelize.sync({ alter: true })` peut entraîner des modifications de la structure de la base de données. Faites une sauvegarde si nécessaire.

- **Dépannage** :
  - **Erreurs de permissions** : Vérifiez les permissions du bot sur le serveur Discord.
  - **Erreurs d'authentification** : Vérifiez les variables d'environnement et les configurations OAuth2.
  - **Problèmes de CORS** : Assurez-vous que le middleware CORS est correctement configuré dans `backend/app.js`.

---

## **Bon développement !**

N'hésitez pas à contribuer au projet ou à signaler des problèmes si vous en rencontrez. Pour toute question, ne me contactez pas.