<div align="center">

# 🛡️ Discord Management Bot

Un bot Discord de gestion open source, en français : modération, tickets, anti-raid, giveaways et commandes fun.

Personnalisation centralisée dans `config.js`, avec un système de giveaways persistant.

[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2018.17-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-bienvenues-brightgreen.svg)](#-contribuer)

[Fonctionnalités](#-fonctionnalités) •
[Installation](#-installation) •
[Configuration](#%EF%B8%8F-configuration) •
[Commandes](#-commandes) •
[Tickets](#-système-de-tickets) •
[Giveaways](#-système-de-giveaways) •
[Anti-raid](#-anti-raid--anti-spam) •
[Données](#-données) •
[FAQ](#-dépannage)

</div>

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🛡️ Modération | Ban, kick, mute, mute temporaire, avertissements persistants, purge, gestion des pseudos, logs de modération |
| 🎫 Tickets | Panel à bouton, formulaire, validation par le staff optionnelle, prise en charge, ajout/retrait de membres |
| 🎉 Giveaways | Participation par bouton, plusieurs gagnants, fin automatique, nouveau tirage, annulation et reprise après redémarrage |
| 🚨 Anti-raid | Détection d'arrivées massives, lockdown automatique avec restauration exacte des permissions, filtre de comptes récents |
| 🤖 Anti-spam | Détection des messages identiques et des mass-mentions, timeout automatique, staff exempté |
| 👑 Administration | Lock/unlock, slowmode, gestion des rôles, sondages, constructeur d'embed interactif, blacklist du bot |
| 🎮 Fun | 8ball, compatibilité amoureuse, affiche WANTED, pierre-feuille-ciseaux, blagues |
| 🎨 Personnalisation | Couleurs des embeds standards, nom du bot, footer, emojis, statut rotatif et textes des tickets dans `config.js` |
| 💾 Persistance | Données JSON sur disque, dont participants, dates de fin et résultats des giveaways |
| 📖 Aide dynamique | Menu `+help` généré automatiquement depuis les commandes chargées |

> ℹ️ Les messages de concours ont leur propre présentation dans `utils/giveaways.js`. Leurs couleurs, textes et boutons ne sont pas actuellement configurables depuis `config.js`.

---

## 📋 Prérequis

- [Node.js](https://nodejs.org) 18.17 ou plus récent, LTS recommandé.
- Un compte Discord et une application sur le [Developer Portal](https://discord.com/developers/applications).
- Un dossier `data/` accessible en écriture et conservé entre les redémarrages et les redéploiements.

> 💾 Le stockage JSON est prévu pour une seule instance du bot. Plusieurs instances ne doivent pas écrire simultanément dans les mêmes fichiers.

---

## 🚀 Installation

### 1. Récupérer le projet

```bash
git clone [https://github.com/Ezeril/Discord-Management-Bot.git](https://github.com/Ezeril/Discord-Management-Bot.git)
cd Discord-Management-Bot
npm install
```

### 2. Créer le bot sur Discord

1. Va sur le [Developer Portal](https://discord.com/developers/applications) → New Application.
2. Onglet Bot → Reset Token → copie le token.
3. Toujours dans l'onglet Bot, active ces deux Privileged Gateway Intents :
   - ✅ Server Members Intent
   - ✅ Message Content Intent

> ℹ️ Le bot n'a pas besoin de Presence Intent.

### 3. Renseigner le token

```bash
cp .env.example .env
```

Ouvre `.env` et remplace la valeur :

```env
TOKEN=ton_token_ici
```

> ⚠️ Ne publie jamais ton `.env`. Il est exclu par le `.gitignore`. Si ton token a fuité, régénère-le immédiatement avec Reset Token.

### 4. Inviter le bot

Remplace `TON_CLIENT_ID`, disponible dans General Information → Application ID, dans ce lien :

```text
[https://discord.com/oauth2/authorize?client_id=TON_CLIENT_ID&scope=bot&permissions=1099914406998](https://discord.com/oauth2/authorize?client_id=TON_CLIENT_ID&scope=bot&permissions=1099914406998)
```

Ce lien demande les permissions utilisées par le bot : voir les salons, envoyer des messages, gérer les messages, intégrer des liens, joindre des fichiers, lire l'historique, ajouter des réactions, expulser, bannir, gérer les pseudos, gérer les rôles, gérer les salons et exclure temporairement des membres.

> 💡 Dans Paramètres du serveur → Rôles, place le rôle du bot au-dessus des rôles qu'il doit pouvoir modérer ou attribuer.

### 5. Configurer puis lancer

```bash
npm run check   # Optionnel : vérifie config.js, .env, commandes et événements
npm start       # Démarre le bot
```

En développement, `npm run dev` relance le bot automatiquement à chaque modification via nodemon.

Le système de giveaways est initialisé depuis `index.js` :

```js
giveaways.init(client);
```

Il reprend les concours sauvegardés après la connexion du bot, sans avoir besoin d'exécuter une commande.

---

## ⚙️ Configuration

La configuration générale se trouve dans [`config.js`](config.js), entièrement commenté. Redémarre le bot après chaque modification.

La durée, le nombre de gagnants et le lot d'un giveaway sont définis directement lors de sa création.

### 🎨 Changer les couleurs des embeds

```js
colors: {
  main:    '#5865F2',   // Couleur principale : aide, informations...
  success: '#57F287',   // ✅ Succès
  error:   '#ED4245',   // ❌ Erreurs
  warning: '#FEE75C',   // ⚠️ Avertissements
  ban:     '#ED4245',   // Logs de ban
  // Voir config.js pour la liste complète.
}
```

Format : hexadécimal `#RRGGBB`.

```js
colors: {
  main: '#9B59B6',
  info: '#9B59B6',
  success: '#2ECC71',
  // ...
}
```

> ℹ️ Ces options s'appliquent aux embeds utilisant `utils/embed.js`. Pour modifier la présentation du message d'un giveaway, consulte la fonction `payload()` dans `utils/giveaways.js`.

### 🏷️ Changer le nom du bot dans les embeds

```js
botName: 'Mon Super Bot',
developer: 'MonPseudo',

embeds: {
  footerText: '{botName} -  Serveur officiel',
  footerIcon: '[https://exemple.com/logo.png](https://exemple.com/logo.png)',
  timestamp: true,
  showBotThumbnail: true,
  helpBannerUrl: '',
}
```

Variables du footer : `{botName}`, `{developer}`.

Une valeur vide pour `footerIcon` désactive l'icône.

### 📊 Changer le statut du bot

```js
presence: {
  status: 'online', // online | idle | dnd
  rotationSeconds: 15,
  activities: [
    { name: '{prefix}help | {botName}', type: 'Playing' },
    { name: '{members} membres', type: 'Watching' },
  ],
},
```

Variables disponibles : `{prefix}`, `{botName}`, `{members}`, `{servers}`.

Types : `Playing`, `Watching`, `Listening`.

### 📚 Toutes les options

| Section | Clé | Description |
|---|---|---|
| Identité | `prefix` | Préfixe des commandes : `+` par défaut |
| Identité | `botName`, `developer` | Nom du bot et du développeur |
| Embeds | `embeds.*` | Footer, icône, timestamp, miniature, bannière |
| Couleurs | `colors.*` | Couleurs des embeds standards, logs, tickets et sondages |
| Emojis | `emojis.*` | Emojis des titres d'embeds |
| Statut | `presence.*` | Statut, activités rotatives, délai de rotation |
| Sécurité | `security.allowedGuilds` | Liste blanche de serveurs : `[]` autorise tous les serveurs |
| Salons | `channels.modLogs` | Salon des logs de modération |
| Salons | `channels.antiRaidLogs` | Salon des alertes anti-raid/spam |
| Modération | `moderation.*` | Raison par défaut, MP aux sanctionnés, délai de suppression du purge |
| Anti-raid | `antiRaid.*` | Seuils, fenêtres, durées et sanctions |
| Tickets | `tickets.*` | Validation, salon des demandes, rôles staff, catégorie, textes du panel et du formulaire |
| Commandes | `disabledCommands` | Désactive des commandes précises, par exemple `['wanted', 'say']` ; `about` ne peut pas être désactivée |
| Commandes | `disabledCategories` | Désactive une catégorie entière, par exemple `['Fun']` ou `['Giveaway']` |

### 🎉 Désactiver les commandes giveaway

Pour désactiver toutes les commandes de cette catégorie :

```js
disabledCategories: ['Giveaway'],
```

Pour désactiver seulement certaines commandes :

```js
disabledCommands: ['gstart', 'greroll'],
```

Ajoute ces valeurs à tes listes existantes si elles contiennent déjà d'autres commandes ou catégories.

> ℹ️ Désactiver les commandes n'annule pas les giveaways déjà enregistrés et n'arrête pas leur vérification automatique. Pour annuler un concours, utilise `+gcancel` avant de désactiver la commande.

### 🔒 Bot privé ou public ?

- Bot public : laisse `security.allowedGuilds: []`.
- Bot privé : liste les IDs de tes serveurs. Le bot quittera automatiquement les autres.

```js
security: {
  allowedGuilds: ['123456789012345678'],
},
```

> 🔎 Pour récupérer un ID : Discord → Paramètres → Avancés → Mode développeur, puis clic droit sur un salon, serveur, rôle ou message → Copier l'identifiant.

---

## 📜 Commandes

Le préfixe par défaut est `+`, modifiable dans `config.js`.

Les arguments entre `<>` sont obligatoires ; ceux entre `[]` sont optionnels.

Partout où un `<membre>` est demandé, tu peux utiliser une mention ou un ID.

Tape `+help` pour le menu interactif ou `+help <commande>` pour le détail.

Les tableaux ci-dessous affichent les commandes sans préfixe.

### 🛡️ Modération

| Commande | Alias | Permission requise | Description |
|---|---|---|---|
| `ban <membre> [raison]` | | Bannir des membres | Bannit un membre |
| `unban <ID> [raison]` | | Bannir des membres | Débannit un utilisateur |
| `kick <membre> [raison]` | `expulser` | Expulser des membres | Expulse un membre |
| `mute <membre> [raison]` | | Exclure temporairement des membres | Timeout de 28 jours, maximum Discord |
| `tempmute <membre> <durée> [raison]` | `tmute` | Exclure temporairement des membres | Timeout temporaire : `30s`, `10m`, `2h`, `1d` |
| `unmute <membre>` | | Exclure temporairement des membres | Rend la parole |
| `warn <membre> <raison>` | | Exclure temporairement des membres | Ajoute un avertissement persistant |
| `warnings <membre>` | `warns` | Exclure temporairement des membres | Liste les avertissements |
| `clearwarns <membre>` | | Exclure temporairement des membres | Efface les avertissements |
| `purge <1-100>` | `clear` | Gérer les messages | Supprime des messages de moins de 14 jours |
| `nick <membre> [pseudo]` | `nickname`, `setnick` | Gérer les pseudos | Change ou réinitialise le pseudo |

### 👑 Administration

| Commande | Alias | Permission requise | Description |
|---|---|---|---|
| `lock` / `unlock` | | Gérer les salons | Verrouille / déverrouille le salon actuel |
| `unlock all` | | Gérer les salons | Lève le lockdown anti-raid et restaure les permissions d'origine |
| `slowmode <secondes>` | `sm` | Gérer les salons | Mode lent : 0 à 21600 secondes |
| `addrole <membre> <rôle>` | | Gérer les rôles | Ajoute un rôle |
| `delrole <membre> <rôle>` | | Gérer les rôles | Retire un rôle |
| `derank <membre>` | | Gérer les rôles | Retire tous les rôles hors rôles gérés |
| `embed` | | Gérer les messages | Constructeur d'embed interactif : titre, description, couleur, image |
| `sondage <question>` | `poll` | Gérer les messages | Sondage avec réactions 👍 🤷 👎 |
| `say <texte>` | `parle`, `repete` | Administrateur | Fait parler le bot |
| `blacklist <membre>` | `bl` | Administrateur | Interdit à un membre d'utiliser le bot |
| `unblacklist <membre>` | `unbl` | Administrateur | Retire un membre de la blacklist |

### 🎫 Tickets

| Commande | Alias | Permission requise | Description |
|---|---|---|---|
| `ticket` | | Administrateur | Envoie le panel d'ouverture de ticket |
| `close` | | Gérer les salons | Ferme le ticket actuel |
| `adduser <membre>` | `add` | Gérer les salons | Ajoute un membre au ticket |
| `removeuser <membre>` | `remove` | Gérer les salons | Retire un membre du ticket |
| `setticketmsg <message>` | `ticketmsg` | Administrateur | Message d'accueil personnalisé : multi-lignes, variable `{user}` |
| `setticketcategory <ID>` | `ticketcategory` | Administrateur | Catégorie où créer les tickets |

### 🎉 Giveaway

| Commande | Alias | Permission requise | Description |
|---|---|---|---|
| `gstart <durée> <gagnants> <lot>` | `giveawaystart` | Gérer les messages | Lance un giveaway dans le salon actuel |
| `gend <ID ou lien du message>` | `giveawayend` | Gérer les messages | Termine un giveaway en cours et tire les gagnants |
| `greroll <ID ou lien du message>` | `giveawayreroll` | Gérer les messages | Tire de nouveaux gagnants pour un giveaway terminé |
| `gcancel <ID ou lien du message>` | `giveawaycancel` | Gérer les messages | Annule un giveaway en cours sans tirer de gagnants |

Exemples :

```text
+gstart 10m 1 Nitro Discord
+gstart 2h 3 Carte cadeau de 10 €
+gstart 7d 2 Accès VIP

+gend 1234567890123456789
+greroll 1234567890123456789
+gcancel 1234567890123456789
```

Les commandes de gestion acceptent aussi le lien du message original :

```text
+gend [https://discord.com/channels/ID_SERVEUR/ID_SALON/ID_MESSAGE](https://discord.com/channels/ID_SERVEUR/ID_SALON/ID_MESSAGE)
```

### ℹ️ Informations

| Commande | Alias | Description |
|---|---|---|
| `help [commande]` | `aide`, `h` | Menu d'aide interactif |
| `ping` | | Latence du bot et de l'API Discord |
| `botinfo` | `stats` | Statistiques du bot |
| `serverinfo` | `si`, `guildinfo` | Informations sur le serveur |
| `userinfo [membre]` | `ui`, `whois`, `memberinfo` | Informations sur un membre |
| `avatar [membre]` | `av`, `pfp` | Avatar en grand |
| `about` | `createur` | Crédits du créateur : portfolio, support et profil Discord |

### 🎮 Fun

| Commande | Alias | Description |
|---|---|---|
| `8ball <question>` | `ask` | Boule magique |
| `couple <membre> [membre]` | `love`, `amour` | Pourcentage de compatibilité |
| `wanted [membre]` | `recherche` | Affiche WANTED avec l'avatar du membre |
| `blague` | `joke`, `humour` | Affiche une blague aléatoire |
| `pfc <pierre\|feuille\|ciseaux>` | `shifumi`, `rps` | Joue à pierre-feuille-ciseaux contre le bot |

> ⚠️ Les commandes `+wanted` et `+blague` s'appuient sur des API tierces, respectivement Popcat et JokeAPI. Si l'une de ces API est indisponible, le bot affiche un message d'erreur. Tu peux désactiver les commandes concernées via `disabledCommands: ['wanted', 'blague']`.

---

## 🎫 Système de tickets

### Mise en place rapide

1. Crée un salon staff pour recevoir les demandes et copie son ID dans `tickets.requestChannelId`.
2. Ajoute les rôles de ton équipe dans `tickets.staffRoleIds` : ils verront automatiquement tous les tickets.
3. Redémarre le bot, puis tape `+ticket` dans le salon où le panel doit apparaître.
4. Utilise éventuellement `+setticketcategory <ID>` pour ranger les tickets et `+setticketmsg <message>` pour personnaliser l'accueil.

### Fonctionnement

```text
Membre clique sur le bouton → remplit le formulaire
        │
        ├─ requireApproval: true
        │      → demande envoyée au staff
        │      → ✅ Accepter / ❌ Refuser
        │
        └─ requireApproval: false
               → le ticket est créé immédiatement

Dans le ticket :
👋 Prendre en charge · 🔔 Rappeler le membre · 🔒 Fermer
```

- Un membre ne peut avoir qu'un seul ticket ouvert et une seule demande en attente.
- Les boutons de gestion nécessitent la permission Gérer les salons.
- Le message d'accueil peut contenir des retours à la ligne et la variable `{user}`.

---

## 🎉 Système de giveaways

### Créer un concours

Exécute la commande dans le salon où le giveaway doit être publié :

```text
+gstart 1h 2 Nitro Discord
```

Le bot publie un message contenant :

- Le lot.
- L'organisateur.
- Le nombre de gagnants prévu.
- Le nombre de participations enregistrées.
- La date de fin et un compte à rebours.
- Un bouton `Participer / Se retirer`.
- L'ID du message, une fois sa présentation actualisée.

### Paramètres acceptés

| Paramètre | Limite |
|---|---|
| Durée | Entre 10 secondes et 30 jours |
| Format de durée | Un entier positif suivi de `s`, `m`, `h` ou `d` |
| Nombre de gagnants | Entre 1 et 20 |
| Lot | Entre 1 et 500 caractères |

Exemples de durées valides : `30s`, `10m`, `2h`, `7d`.

Les formats composés comme `1h30m` ne sont pas acceptés.

### Participation

- Un clic sur le bouton enregistre la participation.
- Un deuxième clic retire la participation.
- La confirmation est privée.
- Chaque membre dispose d'une seule participation enregistrée par giveaway.
- Les participations sont refusées dès que la date de fin est atteinte, même si le tirage n'a pas encore été publié.
- Le compteur du message est actualisé lors de la vérification périodique, pas immédiatement à chaque clic.

### Tirage et résultats

- Les bots et les membres ayant quitté le serveur sont exclus du tirage.
- Un participant ne peut pas gagner plusieurs places dans un même tirage.
- Si le nombre de participants éligibles est inférieur au nombre de gagnants prévu, seuls les participants disponibles sont sélectionnés.
- Si aucun participant n'est éligible, le giveaway se termine sans gagnant.
- Les résultats sont publiés en modifiant le message original.
- Le bouton est désactivé après la fin ou l'annulation.

> ℹ️ Le bot sélectionne les gagnants et publie le résultat. Il ne distribue pas automatiquement le lot.

### Terminer, refaire un tirage ou annuler

```text
+gend <ID ou lien du message>
```

Termine immédiatement un giveaway en cours et effectue le tirage.

```text
+greroll <ID ou lien du message>
```

Effectue un nouveau tirage pour un giveaway terminé. Tous les gagnants déjà sélectionnés lors des tirages précédents sont exclus.

Si aucun nouveau participant éligible ne reste, le nouveau tirage est refusé.

```text
+gcancel <ID ou lien du message>
```

Annule un giveaway en cours sans sélectionner de gagnants.

Ces commandes nécessitent la permission Gérer les messages et ne peuvent gérer que les giveaways du serveur où elles sont exécutées.

### Permissions du bot

Dans le salon du concours, le bot doit pouvoir :

- Voir le salon.
- Envoyer des messages.
- Intégrer des liens.
- Voir les anciens messages.

Ces permissions doivent rester disponibles jusqu'à la publication du résultat.

### Reprise après redémarrage

Le système sauvegarde les giveaways dans :

```text
data/giveaways.json
```

La sauvegarde contient notamment :

- Le serveur, le salon et le message du concours.
- L'organisateur et le lot.
- La date de fin.
- Le nombre de gagnants prévu.
- Les participants.
- L'état du concours : en cours, terminé ou annulé.
- Les gagnants actuels et l'historique des gagnants.
- Les mises à jour du message restant à publier.

Après un redémarrage :

1. Le bot relit la sauvegarde.
2. Les participations enregistrées restent conservées.
3. La date de fin reste identique : la durée ne recommence pas à zéro.
4. Les concours en cours reprennent leur vérification automatique.
5. Les concours dont la date de fin est passée pendant l'arrêt sont traités après la reconnexion.
6. Les concours déjà terminés ne sont pas tirés une seconde fois automatiquement.

Si un résultat a été enregistré mais que sa publication a échoué, le bot réessaie de mettre à jour le message avec les mêmes gagnants.

> ⏱️ La vérification est exécutée toutes les 15 secondes. La publication peut prendre davantage de temps selon le nombre de participants, les autres concours à traiter ou la disponibilité de Discord.

### Limites du stockage

- Le dossier `data/` doit être conservé entre les redémarrages et les redéploiements.
- Une seule instance du bot doit utiliser cette sauvegarde.
- Supprimer le fichier fait perdre les données locales des concours.
- Supprimer le message ou le salon du concours empêche la mise à jour de son résultat sur Discord.
- Un fichier JSON illisible ou invalide provoque l'arrêt du démarrage, plutôt qu'une remise à zéro silencieuse des données.

Aucune base de données externe ni dépendance supplémentaire n'est nécessaire pour ce module.

---

## 🚨 Anti-raid & anti-spam

Configurable dans `antiRaid`. Mets `enabled: false` pour tout désactiver.

| Protection | Fonctionnement | Options |
|---|---|---|
| Détection de raid | X arrivées en Y secondes → lockdown de tous les salons textuels | `joinThreshold`, `joinTimeWindow`, `lockdownDuration` |
| Comptes récents | Kick ou ban des comptes plus jeunes que N jours | `minAccountAgeDays` : 0 désactive le filtre ; `newAccountAction` |
| Anti-spam | N messages identiques en Y secondes → messages supprimés et timeout | `spamThreshold`, `spamTimeWindow`, `spamTimeoutMinutes` |
| Mass-mention | Message avec trop de mentions → suppression et timeout | `massMentionThreshold`, `massMentionTimeoutMinutes` |

Points importants :

- 🔁 Le lockdown mémorise l'état de chaque salon avant de le verrouiller. À la fin, chaque salon retrouve ses permissions d'origine. Un salon d'annonces en lecture seule le reste. Cet état est sauvegardé sur disque : `+unlock all` fonctionne même après un redémarrage.
- 👮 Les membres avec Gérer les messages ou Administrateur sont ignorés par l'anti-spam et l'anti-mention.
- 📣 Renseigne `channels.antiRaidLogs` pour recevoir les alertes dans un salon.
- Les messages sans texte, comme les images seules, ne comptent pas comme du spam.

---

## 💾 Données

Le bot stocke ses données dans le dossier `data/`, sous forme de fichiers JSON créés automatiquement avec écriture atomique.

| Fichier | Contenu |
|---|---|
| `warns.json` | Avertissements par serveur et par membre |
| `mutes.json` | Mutes temporaires en cours |
| `blacklist.json` | Membres blacklistés |
| `ticketConfig.json` / `ticketCategory.json` | Message et catégorie de tickets par serveur |
| `lockdown.json` | État des salons pendant un lockdown |
| `giveaways.json` | Concours, participants, dates de fin, résultats et historique des gagnants |

Ces fichiers sont ignorés par Git.

> ⚠️ Sauvegarde le dossier `data/` avant une mise à jour, un redéploiement ou un déménagement de serveur. Ne remplace pas `giveaways.json` par un fichier vide si tu souhaites conserver les concours.

La reprise des giveaways dépend du disque de l'hébergement. Un système de fichiers effacé lors d'un redéploiement ne permet pas de conserver ces données sans stockage persistant.

---

## 🧩 Ajouter ta propre commande

Crée un fichier dans `commands/<catégorie>/`. Il est chargé automatiquement et apparaît dans `+help` :

```js
// commands/fun/salut.js
const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  name: 'salut',               // Obligatoire.
  aliases: ['hello'],          // Optionnel.
  description: 'Dit bonjour.', // Affiché dans +help.
  usage: 'salut [@membre]',     // Sans le préfixe.
  category: 'Fun',             // Modération | Administration | Tickets | Giveaway | Info | Fun.
  cooldown: 3,                // Secondes ; défaut : 3.

  // userPerms: [PermissionFlagsBits.ManageMessages],
  // botPerms: [PermissionFlagsBits.SendMessages],

  async execute(message, args, client) {
    message.reply({
      embeds: [
        embed.success(
          'Salut !',
          `Bonjour ${message.author} 👋`
        ),
      ],
    });
  },
};
```

Utilitaires disponibles :

- `utils/embed.js` : `embed.success/error/warning/info/mod(titre, description)` et `embed.custom(couleur)`, qui respectent la configuration des embeds standards.
- `utils/permissions.js` : `resolveMember`, `resolveUser` et `replyIfBlocked` pour la résolution des membres et la hiérarchie des rôles.
- `utils/logger.js` : `modLog(...)` pour écrire dans le salon de logs.
- `utils/db.js` : accès aux données persistantes.
- `utils/giveaways.js` : sauvegarde des concours, gestion des participations, tirage, mise à jour des messages et reprise automatique.

Les commandes `gend`, `greroll` et `gcancel` utilisent la fonction `managementCommand()` du module giveaway pour partager les validations et la gestion des erreurs.

---

## 🔧 Dépannage

<details>
<summary>Le bot est en ligne mais ne répond pas aux commandes</summary>

Vérifie que le Message Content Intent est activé dans le Developer Portal, que le bot peut voir et écrire dans le salon et que tu utilises le bon préfixe.

</details>

<details>
<summary>Erreur <code>Used disallowed intents</code> au démarrage</summary>

Active Server Members Intent et Message Content Intent dans l'onglet Bot du Developer Portal.

</details>

<details>
<summary>Erreur <code>TokenInvalid</code> / <code>Aucun TOKEN trouvé</code></summary>

Vérifie que le fichier s'appelle `.env`, et pas `.env.txt`, qu'il contient `TOKEN=...` sans espaces ni guillemets et que le token n'a pas été régénéré.

</details>

<details>
<summary>« Je ne peux pas bannir / rendre muet / modifier ce membre »</summary>

Le rôle du bot doit être au-dessus du rôle le plus haut du membre visé, dans Paramètres du serveur → Rôles.

Le propriétaire du serveur ne peut jamais être sanctionné.

</details>

<details>
<summary>Les demandes de tickets ne sont pas envoyées</summary>

Renseigne `tickets.requestChannelId` avec l'ID d'un salon que le bot peut voir, ou passe `tickets.requireApproval` à `false`.

</details>

<details>
<summary>Le bot quitte mes serveurs tout seul</summary>

Si `security.allowedGuilds` n'est pas vide, le bot quitte tous les serveurs absents de la liste.

Mets `[]` pour autoriser tous les serveurs.

</details>

<details>
<summary>Le bouton giveaway ne répond pas</summary>

Vérifie que `events/interactionCreate.js` importe `utils/giveaways.js` et appelle son gestionnaire avant celui des autres boutons :

```js
if (interaction.isButton()) {
  const handled = await giveaways.handleButton(interaction);

  if (handled) return;

  return await handleButton(interaction, client);
}
```

Vérifie aussi les logs du bot et la présence du concours dans `data/giveaways.json`.

</details>

<details>
<summary>Les giveaways ne reprennent pas après un redémarrage</summary>

Vérifie :

- Que `index.js` importe `utils/giveaways.js`.
- Que `giveaways.init(client)` est appelé au démarrage.
- Que `data/giveaways.json` existe toujours après le redémarrage.
- Que le bot peut lire et écrire dans `data/`.
- Que le fichier n'est pas remplacé lors du redéploiement.

La vérification s'exécute toutes les 15 secondes après la connexion. Le traitement peut prendre davantage de temps selon le nombre de participants.

</details>

<details>
<summary>Le giveaway est terminé mais le message n'a pas été mis à jour</summary>

Vérifie que le message original et son salon existent toujours.

Le bot doit conserver les permissions Voir le salon, Envoyer des messages, Intégrer des liens et Voir les anciens messages.

Consulte les erreurs `[GIVEAWAY UPDATE ...]` et `[GIVEAWAY CHECK ...]` dans la console.

Lorsqu'une mise à jour reste en attente, le bot la réessaie. Si le message ou le salon a été supprimé, il ne peut pas y publier le résultat.

</details>

<details>
<summary>Le bot refuse de démarrer à cause de la sauvegarde giveaway</summary>

Le module refuse de charger un fichier `data/giveaways.json` illisible ou invalide.

Conserve une copie du fichier, puis corrige-le ou restaure une sauvegarde valide.

Ne le supprime pas sans sauvegarde : cela ferait perdre les concours enregistrés.

</details>

<details>
<summary>Le nouveau tirage ne trouve aucun gagnant</summary>

`greroll` exclut tous les gagnants précédemment sélectionnés pour ce concours, ainsi que les bots et les membres ayant quitté le serveur.

S'il ne reste aucun participant éligible, le nouveau tirage est refusé.

</details>

Pour vérifier rapidement ta configuration :

```bash
npm run check
```

---

## 📁 Structure du projet

```text
.
├── index.js                  # Client, commandes, événements et initialisation des giveaways
├── config.js                 # Configuration générale
├── .env.example              # Modèle du fichier de secrets
├── commands/
│   ├── moderation/           # ban, kick, mute, warn, purge...
│   ├── admin/                # lock, roles, embed, sondage, blacklist...
│   ├── tickets/              # ticket, close, adduser...
│   ├── giveaway/
│   │   ├── start.js          # gstart : création d'un concours
│   │   ├── end.js            # gend : fin immédiate et tirage
│   │   ├── reroll.js         # greroll : nouveau tirage
│   │   └── cancel.js         # gcancel : annulation sans gagnant
│   ├── info/                 # help, ping, serverinfo...
│   └── fun/                  # 8ball, couple, wanted, blague, pfc...
├── events/                   # ready, messageCreate, interactionCreate, guildMemberAdd...
├── utils/
│   ├── giveaways.js          # Persistance, participations, tirage et reprise des concours
│   └── ...                   # embed, db, logger, permissions, tickets, lockdown, credits...
├── scripts/check.js          # npm run check
└── data/                     # Données générées, ignorées par Git
    ├── giveaways.json        # Concours, participants et résultats
    └── ...                   # Avertissements, mutes, tickets, lockdown...
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le dépôt et crée une branche :

   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```

2. Commit tes changements :

   ```bash
   git commit -m "feat: ajoute ma fonctionnalité"
   ```

3. Vérifie que tout charge :

   ```bash
   npm run check
   ```

4. Push puis ouvre une Pull Request.

Pour un bug ou une idée, ouvre une [issue](../../issues) en décrivant le comportement attendu, le comportement observé et ta version de Node.js.

Pour un problème de giveaway, indique aussi si le bot a redémarré et joins les erreurs pertinentes de la console, sans publier de token ni de données privées.

---

## 🔐 Sécurité

- Ne publie jamais ton `.env` ni ton token. En cas de fuite, utilise Reset Token immédiatement dans le Developer Portal.
- Si tu découvres une faille, contacte le mainteneur en privé plutôt que d'ouvrir une issue publique.
- Ne publie pas les sauvegardes du dossier `data/` : elles contiennent notamment des identifiants de membres, de serveurs et de salons.

---

## 📄 Licence

Distribué sous licence MIT. Voir [`LICENSE`](LICENSE).

### 👑 Crédits du créateur

Ce bot a été créé par [Ezeril](https://ezeril.xo.je) — Discord : `638010023087177729`.

Les crédits, via la commande `+about` et `utils/credits.js`, ne sont pas configurables et leur intégrité est vérifiée au démarrage.

Si `commands/info/about.js` ou `utils/credits.js` sont modifiés, supprimés ou contournés via `config.js`, le bot refuse de démarrer en affichant un message explicite.

Le créateur est aussi crédité dans `+help`, `+botinfo` et la console.

Tu peux utiliser, modifier et redistribuer le projet librement sous licence MIT, à condition de conserver les crédits. Merci de respecter le travail de son créateur 🙏

---

<div align="center">

Fait avec ❤️ par [Ezeril](https://ezeril.xo.je) • [Discord](https://discord.com/users/638010023087177729)

⭐ Si ce projet t'aide, n'hésite pas à lui laisser une étoile !

</div>
