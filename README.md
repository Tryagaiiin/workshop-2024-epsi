# workshop-2024-epsi

## Prérequis

Cloner le répertoire github : 
```
git clone https://github.com/Tryagaiiin/workshop-2024-epsi.git
```

Installation des dépendances : 
```
npm install
```

Création d'un fichier config.json sous la forme : 
```
"token": "token-application-discord",
"clientId": "application-id",
"guildId": "server-id"
```

Pour récupérer le token et le guildId, aller sur https://discord.com/developers/applications/

Pour récupérer le guildId : activer le mode développeur sur un client discord et faire un clic droit, copier l'identifiant du serveur sur le serveur requis.

## Création de l'environnement 

Création de la base de données : 
```
node .\db.js
```

Ajout des commades slash dans le serveur : 
```
node .\deploy-command.js
```

## Démarrer le bot

```
node .\index.js
```