const {
  PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder,
  TextInputBuilder, TextInputStyle, EmbedBuilder, MessageFlags,
} = require('discord.js');
const embed  = require('../utils/embed');
const config = require('../config');
const { findUserTicket, ticketButtons, openTicket } = require('../utils/tickets');

const EPHEMERAL = MessageFlags.Ephemeral;
const pendingRequests = new Set();

const isStaff = (interaction, perm = PermissionFlagsBits.ManageChannels) =>
  interaction.memberPermissions?.has(perm);

const reply = (interaction, content) => interaction.reply({ content, flags: EPHEMERAL });

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isButton()) return await handleButton(interaction, client);
      if (interaction.isModalSubmit()) return await handleModal(interaction, client);
    } catch (err) {
      console.error('[INTERACTION]', err);
      const payload = { content: `${config.emojis.error} Une erreur est survenue.`, flags: EPHEMERAL };
      if (interaction.replied || interaction.deferred) interaction.followUp(payload).catch(() => {});
      else interaction.reply(payload).catch(() => {});
    }
  },
};

async function handleButton(interaction, client) {
  const { customId, guild } = interaction;
  if (!guild) return;

  if (customId === 'create_ticket') {
    const existing = findUserTicket(guild, interaction.user.id);
    if (existing) return reply(interaction, `${config.emojis.error} Vous avez déjà un ticket ouvert : ${existing}`);
    if (pendingRequests.has(`${guild.id}-${interaction.user.id}`)) {
      return reply(interaction, `${config.emojis.error} Vous avez déjà une demande en attente de validation.`);
    }

    const m = config.tickets.modal;
    const modal = new ModalBuilder().setCustomId('ticket_reason_modal').setTitle(m.title).addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('ticket_reason_input')
          .setLabel(m.label)
          .setPlaceholder(m.placeholder)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMinLength(m.minLength)
          .setMaxLength(m.maxLength)
      )
    );
    return interaction.showModal(modal);
  }

  if (customId.startsWith('accept_ticket_')) {
    if (!isStaff(interaction)) return reply(interaction, `${config.emojis.error} Seul le staff peut accepter une demande.`);

    const userId = customId.split('_')[2];
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return reply(interaction, `${config.emojis.error} Impossible de trouver cet utilisateur.`);

    const existing = findUserTicket(guild, userId);
    if (existing) return reply(interaction, `${config.emojis.error} Cet utilisateur a déjà un ticket ouvert : ${existing}`);

    await interaction.deferReply({ flags: EPHEMERAL });
    try {
      const reasonMatch = interaction.message.embeds[0]?.description?.split('>>> ')[1];
      const channel = await openTicket(guild, user, client, reasonMatch);
      pendingRequests.delete(`${guild.id}-${userId}`);

      const accepted = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(embed.toColor(config.colors.ticketAccepted))
        .setDescription(`${config.emojis.success} **Demande acceptée** par ${interaction.user}\nTicket créé : ${channel}`);
      await interaction.message.edit({ embeds: [accepted], components: [] });

      user.send(`${config.emojis.success} Votre demande de ticket sur **${guild.name}** a été acceptée ! Rendez-vous dans ${channel}.`).catch(() => {});
      await interaction.editReply({ content: `${config.emojis.success} Ticket créé : ${channel}` });
    } catch (err) {
      console.error('[TICKET ACCEPT]', err);
      await interaction.editReply({ content: `${config.emojis.error} Erreur lors de la création du ticket. Vérifiez mes permissions.` });
    }
    return;
  }

  if (customId.startsWith('deny_ticket_')) {
    if (!isStaff(interaction)) return reply(interaction, `${config.emojis.error} Seul le staff peut refuser une demande.`);

    const userId = customId.split('_')[2];
    const user = await client.users.fetch(userId).catch(() => null);
    pendingRequests.delete(`${guild.id}-${userId}`);

    const denied = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(embed.toColor(config.colors.ticketDenied))
      .setDescription(`${config.emojis.error} **Demande refusée** par ${interaction.user}`);
    await interaction.message.edit({ embeds: [denied], components: [] });

    await reply(interaction, `${config.emojis.success} La demande de **${user?.tag ?? 'Utilisateur inconnu'}** a été refusée.`);
    user?.send(`${config.emojis.error} Votre demande de ticket sur **${guild.name}** a été refusée par le staff.`).catch(() => {});
    return;
  }

  if (customId === 'claim_ticket') {
    if (!isStaff(interaction)) return reply(interaction, `${config.emojis.error} Seul le staff peut prendre en charge ce ticket.`);
    await interaction.reply({ embeds: [embed.success('Prise en charge', `Ce ticket est maintenant géré par **${interaction.user.tag}**.`)] });
    await interaction.message.edit({ components: [ticketButtons(true)] }).catch(() => {});
    return;
  }

  if (customId === 'notify_user') {
    if (!isStaff(interaction)) return reply(interaction, `${config.emojis.error} Seul le staff peut relancer le membre.`);
    const ownerId = interaction.channel.topic;
    if (!ownerId || !/^\d+$/.test(ownerId)) return reply(interaction, `${config.emojis.error} Impossible de trouver le propriétaire.`);

    await interaction.reply({
      content: `<@${ownerId}>`,
      embeds: [embed.warning('Rappel 🔔', `Bonjour <@${ownerId}> ! Le staff attend une réponse de votre part.`)],
    });
    return;
  }

  if (customId === 'close_ticket') {
    if (!isStaff(interaction)) return reply(interaction, `${config.emojis.error} Seul le staff peut fermer ce ticket.`);
    const delay = config.tickets.closeDelaySeconds;
    await interaction.reply(`${config.emojis.lock} Ce ticket sera supprimé dans ${delay} seconde(s)...`);
    setTimeout(() => interaction.channel.delete().catch(() => {}), delay * 1000);
    return;
  }

  if (customId === 'open_embed_modal') {
    if (!isStaff(interaction, PermissionFlagsBits.ManageMessages)) {
      return reply(interaction, `${config.emojis.error} Vous n'avez pas la permission d'utiliser le constructeur d'embed.`);
    }
    const input = (id, label, style, required, placeholder) => {
      const t = new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(required);
      if (placeholder) t.setPlaceholder(placeholder);
      return new ActionRowBuilder().addComponents(t);
    };
    const modal = new ModalBuilder().setCustomId('embed_modal').setTitle("Création de l'Embed").addComponents(
      input('embed_title', 'Titre',              TextInputStyle.Short,     true),
      input('embed_desc',  'Description',        TextInputStyle.Paragraph, true),
      input('embed_color', 'Couleur (Hex)',      TextInputStyle.Short,     false, config.colors.embedBuilderDefault),
      input('embed_image', 'Lien Image (URL)',   TextInputStyle.Short,     false),
    );
    return interaction.showModal(modal);
  }
}

async function handleModal(interaction, client) {
  const { guild } = interaction;
  if (!guild) return;

  if (interaction.customId === 'ticket_reason_modal') {
    const user   = interaction.user;
    const reason = interaction.fields.getTextInputValue('ticket_reason_input');

    if (!config.tickets.requireApproval) {
      if (findUserTicket(guild, user.id)) return reply(interaction, `${config.emojis.error} Vous avez déjà un ticket ouvert.`);
      await interaction.deferReply({ flags: EPHEMERAL });
      try {
        const channel = await openTicket(guild, user, client, reason);
        await interaction.editReply({ content: `${config.emojis.success} Votre ticket a été créé : ${channel}` });
      } catch (err) {
        console.error('[TICKET CREATE]', err);
        await interaction.editReply({ content: `${config.emojis.error} Impossible de créer le ticket. Contactez un administrateur.` });
      }
      return;
    }

    const staffChannel = guild.channels.cache.get(config.tickets.requestChannelId);
    if (!staffChannel) {
      return reply(interaction, `${config.emojis.error} Le salon des demandes de tickets n'est pas configuré (\`tickets.requestChannelId\`). Contactez un administrateur.`);
    }

    const requestEmbed = embed.custom(config.colors.ticketRequest)
      .setTitle(`${config.emojis.ticket} Nouvelle Demande de Ticket`)
      .setDescription(`**${user.tag}** (${user}) souhaite ouvrir un ticket.\n*ID: ${user.id}*\n\n**Raison de la demande :**\n>>> ${reason}`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`accept_ticket_${user.id}`).setLabel('Accepter').setEmoji('✅').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`deny_ticket_${user.id}`).setLabel('Refuser').setEmoji('❌').setStyle(ButtonStyle.Danger),
    );

    await staffChannel.send({ embeds: [requestEmbed], components: [row] });
    pendingRequests.add(`${guild.id}-${user.id}`);
    return reply(interaction, '⏳ Votre demande de ticket a bien été envoyée au staff. Veuillez patienter...');
  }

  if (interaction.customId === 'embed_modal') {
    if (!isStaff(interaction, PermissionFlagsBits.ManageMessages)) {
      return reply(interaction, `${config.emojis.error} Vous n'avez pas la permission d'utiliser le constructeur d'embed.`);
    }

    const title = interaction.fields.getTextInputValue('embed_title');
    const desc  = interaction.fields.getTextInputValue('embed_desc');
    const color = interaction.fields.getTextInputValue('embed_color').trim();
    const image = interaction.fields.getTextInputValue('embed_image').trim();

    if (color && !embed.isValidHex(color)) {
      return reply(interaction, `${config.emojis.error} Couleur invalide. Utilise un code hexadécimal, ex : \`#5865F2\`.`);
    }
    if (image && !/^https?:\/\/\S+$/i.test(image)) {
      return reply(interaction, `${config.emojis.error} Le lien de l'image doit commencer par http:// ou https://.`);
    }

    const finalEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(desc)
      .setColor(embed.toColor(color, config.colors.embedBuilderDefault));
    if (config.embeds.timestamp) finalEmbed.setTimestamp();
    if (image) finalEmbed.setImage(image);

    await interaction.channel.send({ embeds: [finalEmbed] });
    return reply(interaction, `${config.emojis.success} Embed envoyé avec succès !`);
  }
}
