const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType, MessageFlags } = require('discord.js');
const config = require('../../config');
const embed  = require('../../utils/embed');
const { CREDITS } = require('../../utils/credits');

// Apparence des catégories dans le menu (les catégories inconnues reçoivent 📁)
const CATEGORY_META = {
  'Modération':     { emoji: '🛡️', label: 'Modération',     description: 'Commandes pour gérer les membres' },
  'Tickets':        { emoji: '🎫', label: 'Tickets',        description: 'Commandes du système de tickets' },
  'Administration': { emoji: '👑', label: 'Administration', description: 'Commandes pour gérer le serveur' },
  'Info':           { emoji: 'ℹ️', label: 'Informations',   description: 'Statistiques et informations utiles' },
  'Fun':            { emoji: '🎮', label: 'Fun',            description: 'Commandes mini-jeux' },
};

const firstSentence = (text = '') => {
  const s = text.split(/(?<=[.!?])\s/)[0];
  return s.length > 90 ? `${s.slice(0, 87)}...` : s;
};

module.exports = {
  name: 'help',
  aliases: ['aide', 'h'],
  description: 'Affiche toutes les commandes du bot avec un menu interactif.',
  usage: 'help [commande]',
  category: 'Info',
  cooldown: 5,

  async execute(message, args, client) {
    // ── Détail d'une commande ──
    if (args[0]) {
      const cmd = client.commands.get(args[0].toLowerCase());
      if (!cmd) return message.reply({ embeds: [embed.error('Erreur', `Commande \`${args[0]}\` introuvable.`)] });

      return message.reply({
        embeds: [
          embed.custom(config.colors.main, { footerText: `${config.embeds.footerText} • Créé par ${CREDITS.name}` })
            .setTitle(`${config.emojis.info} Commande : \`${config.prefix}${cmd.name}\``)
            .addFields(
              { name: 'Description', value: cmd.description || 'Aucune description.' },
              { name: 'Utilisation', value: `\`${config.prefix}${cmd.usage || cmd.name}\`` },
              { name: 'Alias', value: cmd.aliases?.length ? cmd.aliases.map(a => `\`${a}\``).join(', ') : 'Aucun' },
              { name: 'Catégorie', value: cmd.category || 'Autre', inline: true },
              { name: 'Cooldown', value: `${cmd.cooldown ?? 3}s`, inline: true },
            ),
        ],
      });
    }

    // ── Regroupement dynamique des commandes par catégorie ──
    const unique = [...new Set(client.commands.values())];
    const byCategory = new Map();
    for (const cmd of unique) {
      const cat = cmd.category || 'Autre';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(cmd);
    }

    const order = [...Object.keys(CATEGORY_META), ...[...byCategory.keys()].filter(c => !(c in CATEGORY_META))];
    const categories = order.filter(c => byCategory.has(c)).map(c => {
      const meta = CATEGORY_META[c] || { emoji: '📁', label: c, description: `Commandes ${c}` };
      const lines = byCategory.get(c)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(cmd => `\`${config.prefix}${cmd.name}\` — ${firstSentence(cmd.description)}`)
        .join('\n');
      return { key: c, ...meta, lines: lines.slice(0, 4000) };
    });

    const homeEmbed = embed.custom(config.colors.main, { footerText: `${client.commands.size} commandes/alias chargés` })
      .setTitle(`${config.emojis.info} ${client.user.username} — Aide`)
      .setDescription(
        `Bienvenue dans le menu d'aide de **${config.botName}**.\n\n` +
        `**Préfixe :** \`${config.prefix}\`\n` +
        `**Créateur :** ${CREDITS.name} • [Portfolio](${CREDITS.portfolio})\n\n` +
        `Sélectionne une catégorie dans le menu déroulant ci-dessous.\n\n` +
        `*Utilise \`${config.prefix}help <commande>\` pour le détail d'une commande.*`
      );
    if (config.embeds.showBotThumbnail) homeEmbed.setThumbnail(client.user.displayAvatarURL());
    if (config.embeds.helpBannerUrl) homeEmbed.setImage(config.embeds.helpBannerUrl);

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`help_menu_${message.id}`)
      .setPlaceholder('Sélectionne une catégorie...')
      .addOptions([
        { label: 'Accueil', description: 'Retourner au menu principal', value: 'home', emoji: '🏠' },
        ...categories.map(c => ({ label: c.label, description: c.description, value: c.key, emoji: c.emoji })),
      ].slice(0, 25));

    const helpMessage = await message.reply({
      embeds: [homeEmbed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });

    const collector = helpMessage.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000,
    });

    collector.on('collect', async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: `${config.emojis.error} Ce menu d'aide ne t'appartient pas. Utilise \`${config.prefix}help\` pour ouvrir le tien.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const value = interaction.values[0];
      if (value === 'home') return interaction.update({ embeds: [homeEmbed] });

      const cat = categories.find(c => c.key === value);
      if (!cat) return interaction.deferUpdate();

      await interaction.update({
        embeds: [
          embed.custom(config.colors.main, { footerText: `${config.embeds.footerText} • ${cat.label}` })
            .setTitle(`${cat.emoji} ${cat.label}`)
            .setDescription(cat.lines),
        ],
      });
    });

    collector.on('end', () => {
      menu.setDisabled(true);
      helpMessage.edit({ components: [new ActionRowBuilder().addComponents(menu)] }).catch(() => {});
    });
  },
};
