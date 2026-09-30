<div align="center">

# 🛡️ Discord Management Bot

**Un bot Discord de gestion open source, en français : modération, tickets, anti-raid et commandes fun.**
**Entièrement personnalisable depuis un seul fichier : `config.js`.**

[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2018.17-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-bienvenues-brightgreen.svg)](#-contribuer)

[Fonctionnalités](#-fonctionnalités) •
[Installation](#-installation) •
[Configuration](#%EF%B8%8F-configuration) •
[Commandes](#-commandes) •
[Tickets](#-système-de-tickets) •
[Anti-raid](#-anti-raid--anti-spam) •
[FAQ](#-dépannage)

</div>

---

## ✨ Fonctionnalités

| | |
|---|---|
| 🛡️ **Modération** | ban, kick, mute, mute temporaire, avertissements persistants, purge, gestion des pseudos, logs de modération |
| 🎫 **Tickets** | Panel à bouton, formulaire, validation par le staff (optionnelle), prise en charge, ajout/retrait de membres |
| 🚨 **Anti-raid** | Détection d'arrivées massives, lockdown automatique **avec restauration exacte des permissions**, filtre de comptes récents |
| 🤖 **Anti-spam** | Détection des messages identiques et des mass-mentions, timeout automatique, staff exempté |
| 👑 **Administration** | Lock/unlock, slowmode, gestion des rôles, sondages, constructeur d'embed interactif, blacklist du bot |
| 🎮 **Fun** | 8ball, compatibilité amoureuse, affiche WANTED |
| 🎨 **Personnalisation** | Couleurs des embeds, nom du bot, footer, emojis, statut rotatif, textes des tickets… tout dans `config.js` |
| 📖 **Aide dynamique** | Menu `+help` généré automatiquement depuis les commandes chargées |

---

## 📋 Prérequis

- [Node.js](https://nodejs.org) **18.17 ou plus récent** (LTS recommandé)
- Un compte Discord et une application sur le [Developer Portal](https://discord.com/developers/applications)

---

## 🚀 Installation

### 1. Récupérer le projet

```bash
git clone https://github.com/<ton-pseudo>/<ton-repo>.git
cd <ton-repo>
npm install
```

### 2. Créer le bot sur Discord

1. Va sur le [Developer Portal](https://discord.com/developers/applications) → **New Application**.
2. Onglet **Bot** → **Reset Token** → copie le token (tu ne pourras plus le revoir).
3. Toujours dans l'onglet **Bot**, active ces deux **Privileged Gateway Intents** :
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**

   > ℹ️ Le bot n'a **pas** besoin de *Presence Intent*.

### 3. Renseigner le token

```bash
cp .env.example .env
```

Ouvre `.env` et remplace la valeur :

```env
TOKEN=ton_token_ici
```

> ⚠️ **Ne publie jamais ton `.env`.** Il est déjà exclu par le `.gitignore`. Si ton token a fuité un jour, régénère-le immédiatement avec **Reset Token**.

### 4. Inviter le bot

Remplace `TON_CLIENT_ID` (onglet **General Information** → *Application ID*) dans ce lien :

```
https://discord.com/oauth2/authorize?client_id=TON_CLIENT_ID&scope=bot&permissions=1099914406998
```

Ce lien demande uniquement les permissions utilisées par le bot : voir les salons, envoyer des messages, gérer les messages, intégrer des liens, joindre des fichiers, lire l'historique, ajouter des réactions, expulser, bannir, gérer les pseudos, gérer les rôles, gérer les salons et exclure temporairement des membres.

> 💡 **Important :** dans *Paramètres du serveur → Rôles*, place le rôle du bot **au-dessus** des rôles qu'il doit pouvoir modérer ou attribuer.

### 5. Configurer puis lancer

```bash
npm run check   # (optionnel) vérifie config.js, .env, commandes et événements
npm start       # démarre le bot
```

En développement, `npm run dev` relance le bot automatiquement à chaque modification (via nodemon).

---

## ⚙️ Configuration

Tout se passe dans **[`config.js`](config.js)**, entièrement commenté. Redémarre le bot après chaque modification.

### 🎨 Changer les couleurs des embeds

```js
colors: {
  main:    '#5865F2',   // couleur principale (aide, infos...)
  success: '#57F287',   // ✅ succès
  error:   '#ED4245',   // ❌ erreurs
  warning: '#FEE75C',   // ⚠️ avertissements
  ban:     '#ED4245',   // logs de ban
  // ... (voir config.js pour la liste complète)
}
```

Format : hexadécimal `#RRGGBB`. Tu peux tout mettre en violet en une minute :

```js
colors: { main: '#9B59B6', info: '#9B59B6', success: '#2ECC71', /* ... */ }
```

### 🏷️ Changer le nom du bot dans les embeds

```js
botName: 'Mon Super Bot',      // utilisé dans les footers, l'aide, le statut...
developer: 'MonPseudo',

embeds: {
  footerText: '{botName} • Serveur officiel',   // variables : {botName}, {developer}
  footerIcon: 'https://exemple.com/logo.png',   // '' = aucune
  timestamp: true,                               // heure en bas des embeds
  showBotThumbnail: true,                        // avatar du bot dans l'aide/infos
  helpBannerUrl: '',                             // bannière de l'aide
}
```

### 📊 Changer le statut du bot

```js
presence: {
  status: 'online',            // online | idle | dnd 
  rotationSeconds: 15,
  activities: [
    { name: '{prefix}help | {botName}', type: 'Playing' },
    { name: '{members} membres',        type: 'Watching' },
  ],
},
```

Variables disponibles : `{prefix}`, `{botName}`, `{members}`, `{servers}`
Types : `Playing`, `Watching`, `Listening`

### 📚 Toutes les options

| Section | Clé | Description |
|---|---|---|
| Identité | `prefix` | Préfixe des commandes (`+` par défaut) |
| | `botName`, `developer` | Nom du bot et du développeur |
| Embeds | `embeds.*` | Footer, icône, timestamp, miniature, bannière |
| Couleurs | `colors.*` | Toutes les couleurs (base, logs de modération, tickets, sondages…) |
| Emojis | `emojis.*` | Emojis des titres d'embeds |
| Statut | `presence.*` | Statut, activités rotatives, délai de rotation |
| Sécurité | `security.allowedGuilds` | Liste blanche de serveurs (`[]` = tous autorisés) |
| Salons | `channels.modLogs` | Salon des logs de modération |
| | `channels.antiRaidLogs` | Salon des alertes anti-raid/spam |
| Modération | `moderation.*` | Raison par défaut, MP aux sanctionnés, délai de suppression du purge |
| Anti-raid | `antiRaid.*` | Seuils, fenêtres, durées, sanctions (voir [Anti-raid](#-anti-raid--anti-spam)) |
| Tickets | `tickets.*` | Validation, salon des demandes, rôles staff, catégorie, textes du panel et du formulaire |
| Commandes | `disabledCommands` | Désactive des commandes précises, ex : `['wanted', 'say']` (`about` ne peut pas être désactivée) |
| | `disabledCategories` | Désactive une catégorie entière, ex : `['Fun']` |

### 🔒 Bot privé ou public ?

- **Bot public :** laisse `security.allowedGuilds: []`.
- **Bot privé :** liste les IDs de tes serveurs, le bot quittera automatiquement tous les autres :

  ```js
  security: { allowedGuilds: ['123456789012345678'] },
  ```

> 🔎 **Récupérer un ID :** Discord → *Paramètres → Avancés → Mode développeur*, puis clic droit sur un salon / serveur / rôle → **Copier l'identifiant**.

---

## 📜 Commandes

Le préfixe par défaut est `+` (modifiable). Les arguments entre `<>` sont obligatoires, ceux entre `[]` optionnels. Partout où un `<membre>` est demandé, tu peux utiliser une **mention** ou un **ID**.
Tape `+help` pour le menu interactif ou `+help <commande>` pour le détail.

### 🛡️ Modération

| Commande | Alias | Permission requise | Description |
|---|---|---|---|
| `ban <membre> [raison]` | | Bannir des membres | Bannit un membre |
| `unban <ID> [raison]` | | Bannir des membres | Débannit un utilisateur |
| `kick <membre> [raison]` | `expulser` | Expulser des membres | Expulse un membre |
| `mute <membre> [raison]` | | Exclure temporairement des membres | Timeout de 28 jours (maximum Discord) |
| `tempmute <membre> <durée> [raison]` | `tmute` | Exclure temporairement des membres | Timeout temporaire (`30s`, `10m`, `2h`, `1d`) |
| `unmute <membre>` | | Exclure temporairement des membres | Rend la parole |
| `warn <membre> <raison>` | | Exclure temporairement des membres | Ajoute un avertissement (persistant) |
| `warnings <membre>` | `warns` | Exclure temporairement des membres | Liste les avertissements |
| `clearwarns <membre>` | | Exclure temporairement des membres | Efface les avertissements |
| `purge <1-100>` | `clear` | Gérer les messages | Supprime des messages (< 14 jours) |
| `nick <membre> [pseudo]` | `nickname`, `setnick` | Gérer les pseudos | Change ou réinitialise le pseudo |

### 👑 Administration

| Commande | Alias | Permission requise | Description |
|---|---|---|---|
| `lock` / `unlock` | | Gérer les salons | Verrouille / déverrouille le salon actuel |
| `unlock all` | | Gérer les salons | Lève le lockdown anti-raid et restaure les permissions d'origine |
| `slowmode <secondes>` | `sm` | Gérer les salons | Mode lent (0 à 21600) |
| `addrole <membre> <rôle>` | | Gérer les rôles | Ajoute un rôle |
| `delrole <membre> <rôle>` | | Gérer les rôles | Retire un rôle |
| `derank <membre>` | | Gérer les rôles | Retire tous les rôles (hors rôles gérés) |
| `embed` | | Gérer les messages | Constructeur d'embed interactif (titre, description, couleur, image) |
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
| `setticketmsg <message>` | `ticketmsg` | Administrateur | Message d'accueil personnalisé (multi-lignes, variable `{user}`) |
| `setticketcategory <ID>` | `ticketcategory` | Administrateur | Catégorie où créer les tickets |

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

> ⚠️ `+wanted` s'appuie sur une **API tierce** (Popcat). Si elle est hors ligne, le bot affiche un message d'erreur propre ; tu peux désactiver la commande via `disabledCommands: ['wanted']`.

---

## 🎫 Système de tickets

### Mise en place rapide

1. Crée un salon staff pour recevoir les demandes et copie son ID dans `tickets.requestChannelId`.
2. (Recommandé) Ajoute les rôles de ton équipe dans `tickets.staffRoleIds` : ils verront automatiquement tous les tickets.
3. Redémarre le bot, puis tape `+ticket` dans le salon où le panel doit apparaître.
4. (Optionnel) `+setticketcategory <ID>` pour ranger les tickets dans une catégorie, `+setticketmsg <message>` pour personnaliser l'accueil.

### Fonctionnement

```
Membre clique sur le bouton → remplit le formulaire
        │
        ├─ requireApproval: true  → demande envoyée au staff → ✅ Accepter / ❌ Refuser
        └─ requireApproval: false → le ticket est créé immédiatement

Dans le ticket : 👋 Prendre en charge · 🔔 Rappeler le membre · 🔒 Fermer
```

- Un membre ne peut avoir **qu'un seul ticket** ouvert (et une seule demande en attente).
- Les boutons de gestion nécessitent la permission **Gérer les salons**.
- Le message d'accueil peut contenir des retours à la ligne et la variable `{user}`.

---

## 🚨 Anti-raid & anti-spam

Configurable dans `antiRaid` (mets `enabled: false` pour tout désactiver).

| Protection | Fonctionnement | Options |
|---|---|---|
| **Détection de raid** | X arrivées en Y secondes → **lockdown** de tous les salons textuels | `joinThreshold`, `joinTimeWindow`, `lockdownDuration` |
| **Comptes récents** | Kick ou ban des comptes plus jeunes que N jours | `minAccountAgeDays` (0 = off), `newAccountAction` |
| **Anti-spam** | N messages identiques en Y secondes → messages supprimés + timeout | `spamThreshold`, `spamTimeWindow`, `spamTimeoutMinutes` |
| **Mass-mention** | Message avec trop de mentions → supprimé + timeout | `massMentionThreshold`, `massMentionTimeoutMinutes` |

Points importants :

- 🔁 **Le lockdown mémorise l'état de chaque salon** avant de le verrouiller. À la fin, chaque salon retrouve exactement ses permissions d'origine (un salon d'annonces en lecture seule le reste). Cet état est sauvegardé sur disque : `+unlock all` fonctionne même après un redémarrage.
- 👮 Les membres avec **Gérer les messages** ou **Administrateur** sont ignorés par l'anti-spam et l'anti-mention.
- 📣 Renseigne `channels.antiRaidLogs` pour recevoir les alertes dans un salon.
- Les messages sans texte (images seules…) ne comptent pas comme du spam.

---

## 💾 Données

Le bot stocke ses données dans le dossier `data/` (fichiers JSON créés automatiquement, écriture atomique) :

| Fichier | Contenu |
|---|---|
| `warns.json` | Avertissements par serveur et par membre |
| `mutes.json` | Mutes temporaires en cours |
| `blacklist.json` | Membres blacklistés |
| `ticketConfig.json` / `ticketCategory.json` | Message et catégorie de tickets par serveur |
| `lockdown.json` | État des salons pendant un lockdown |

Ces fichiers sont ignorés par Git. **Sauvegarde le dossier `data/`** avant une mise à jour ou un déménagement de serveur.

---

## 🧩 Ajouter ta propre commande

Crée un fichier dans `commands/<catégorie>/`, il est chargé automatiquement et apparaît dans `+help` :

```js
// commands/fun/salut.js
const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  name: 'salut',                      // obligatoire
  aliases: ['hello'],                 // optionnel
  description: 'Dit bonjour.',        // affiché dans +help
  usage: 'salut [@membre]',           // sans le préfixe
  category: 'Fun',                    // Modération | Administration | Tickets | Info | Fun
  cooldown: 3,                        // secondes (défaut : 3)
  // userPerms: [PermissionFlagsBits.ManageMessages],   // permissions du membre
  // botPerms:  [PermissionFlagsBits.SendMessages],     // permissions du bot

  async execute(message, args, client) {
    message.reply({ embeds: [embed.success('Salut !', `Bonjour ${message.author} 👋`)] });
  },
};
```

Utilitaires disponibles :

- `utils/embed.js` : `embed.success/error/warning/info/mod(titre, description)` et `embed.custom(couleur)`, qui respectent automatiquement ta configuration.
- `utils/permissions.js` : `resolveMember`, `resolveUser` et `replyIfBlocked` (hiérarchie des rôles).
- `utils/logger.js` : `modLog(...)` pour écrire dans le salon de logs.
- `utils/db.js` : accès aux données persistantes.

---

## 🔧 Dépannage

<details>
<summary><b>Le bot est en ligne mais ne répond pas aux commandes</b></summary>

Vérifie que le **Message Content Intent** est activé dans le Developer Portal, que le bot peut voir et écrire dans le salon, et que tu utilises le bon préfixe.
</details>

<details>
<summary><b>Erreur <code>Used disallowed intents</code> au démarrage</b></summary>

Active **Server Members Intent** et **Message Content Intent** dans l'onglet *Bot* du Developer Portal.
</details>

<details>
<summary><b>Erreur <code>TokenInvalid</code> / <code>Aucun TOKEN trouvé</code></b></summary>

Vérifie que le fichier s'appelle bien `.env` (et pas `.env.txt`), qu'il contient `TOKEN=...` sans espaces ni guillemets, et que le token n'a pas été régénéré.
</details>

<details>
<summary><b>« Je ne peux pas bannir / rendre muet / modifier ce membre »</b></summary>

Le rôle du bot doit être **au-dessus** du rôle le plus haut du membre visé (*Paramètres du serveur → Rôles*). Le propriétaire du serveur ne peut jamais être sanctionné.
</details>

<details>
<summary><b>Les demandes de tickets ne sont pas envoyées</b></summary>

Renseigne `tickets.requestChannelId` avec l'ID d'un salon que le bot peut voir, ou passe `tickets.requireApproval` à `false`.
</details>

<details>
<summary><b>Le bot quitte mes serveurs tout seul</b></summary>

Si `security.allowedGuilds` n'est pas vide, le bot quitte tous les serveurs absents de la liste. Mets `[]` pour autoriser tous les serveurs.
</details>

Pour vérifier rapidement ta configuration : `npm run check`.

---

## 📁 Structure du projet

```
.
├── index.js               # Point d'entrée : client, chargement commandes/événements
├── config.js              # ⚙️ Toute la personnalisation
├── .env.example           # Modèle du fichier de secrets
├── commands/
│   ├── moderation/        # ban, kick, mute, warn, purge...
│   ├── admin/             # lock, roles, embed, sondage, blacklist...
│   ├── tickets/           # ticket, close, adduser...
│   ├── info/              # help, ping, serverinfo...
│   └── fun/               # 8ball, couple, wanted
├── events/                # ready, messageCreate, interactionCreate, guildMemberAdd...
├── utils/                 # embed, db, logger, permissions, tickets, lockdown, credits
├── scripts/check.js       # npm run check
└── data/                  # Données générées (ignorées par Git)
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le dépôt et crée une branche : `git checkout -b feature/ma-fonctionnalite`
2. Commit tes changements : `git commit -m "feat: ajoute ma fonctionnalité"`
3. Vérifie que tout charge : `npm run check`
4. Push puis ouvre une **Pull Request**

Pour un bug ou une idée, ouvre une [issue](../../issues) en décrivant le comportement attendu, le comportement observé et ta version de Node.js.

---

## 🔐 Sécurité

- Ne publie jamais ton `.env` ni ton token. En cas de fuite : **Reset Token** immédiatement dans le Developer Portal.
- Si tu découvres une faille, contacte le mainteneur en privé plutôt que d'ouvrir une issue publique.

---

## 📄 Licence

Distribué sous licence **MIT**. Voir [`LICENSE`](LICENSE).

### 👑 Crédits du créateur

Ce bot a été créé par **[Ezeril](https://ezeril.xo.je)** (Discord : `638010023087177729`).

Les crédits (commande `+about`, `utils/credits.js`) ne sont **pas configurables** et leur intégrité est vérifiée au démarrage : si `commands/info/about.js` ou `utils/credits.js` sont modifiés, supprimés ou contournés via `config.js`, le bot **refuse de démarrer** en affichant un message explicite. Le créateur est aussi crédité dans `+help`, `+botinfo` et la console.

Tu peux utiliser, modifier et redistribuer le projet librement (MIT), à condition de **conserver les crédits**. Merci de respecter le travail de son créateur 🙏

---

<div align="center">

Fait avec ❤️ par [**Ezeril**](https://ezeril.xo.je) • [Discord](https://discord.com/users/638010023087177729)

⭐ Si ce projet t'aide, n'hésite pas à lui laisser une étoile !

</div>
