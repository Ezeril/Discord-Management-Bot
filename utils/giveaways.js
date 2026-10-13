const fs = require('node:fs');
const path = require('node:path');
const { randomInt } = require('node:crypto');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  MessageFlags,
  escapeMarkdown,
} = require('discord.js');

const embed = require('./embed');

const FILE = path.join(__dirname, '../data/giveaways.json');
const BUTTON_ID = 'giveaway_join';
const locks = new Set();
const initializedClients = new WeakSet();

let records = {};

if (fs.existsSync(FILE)) {
  try {
    records = JSON.parse(fs.readFileSync(FILE, 'utf8'));

    if (!records || typeof records !== 'object' || Array.isArray(records)) {
      throw new Error('Format de sauvegarde invalide.');
    }
  } catch (error) {
    throw new Error(
      `Impossible de lire ${FILE}. Corrige ou restaure ce fichier avant de démarrer.\n${error.message}`
    );
  }
}

function commit(giveaway) {
  const next = {
    ...records,
    [giveaway.messageId]: giveaway,
  };

  fs.mkdirSync(path.dirname(FILE), { recursive: true });

  const temporary = `${FILE}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(next, null, 2), 'utf8');
  fs.renameSync(temporary, FILE);

  records = next;
  return giveaway;
}

function get(id, guildId) {
  const giveaway = records[id];

  if (!giveaway || giveaway.guildId !== guildId) {
    throw new Error('Giveaway introuvable sur ce serveur.');
  }

  return giveaway;
}

async function exclusive(id, callback) {
  if (locks.has(id)) {
    throw new Error('Ce giveaway est en cours de traitement. Réessaie dans un instant.');
  }

  locks.add(id);

  try {
    return await callback();
  } finally {
    locks.delete(id);
  }
}

function parseDuration(value) {
  const match = /^([1-9]\d*)(s|m|h|d)$/i.exec(value || '');
  if (!match) return null;

  const units = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  const duration = Number(match[1]) * units[match[2].toLowerCase()];

  if (!Number.isSafeInteger(duration)) return null;
  if (duration < 10_000 || duration > 30 * units.d) return null;

  return duration;
}

function parseMessageId(value, guildId) {
  if (/^\d{17,20}$/.test(value || '')) return value;

  const match = /^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)\/?$/.exec(
    value || ''
  );

  if (!match || match[1] !== guildId) return null;

  return match[3];
}

function payload(giveaway) {
  const active = giveaway.status === 'active';
  const cancelled = giveaway.status === 'cancelled';
  const winners = giveaway.winners || [];
  const timestamp = Math.floor(giveaway.endsAt / 1000);

  let title = '🎉 Giveaway';
  let color = 0x5865f2;
  let result = '';

  if (cancelled) {
    title = '🚫 Giveaway annulé';
    color = 0xed4245;
    result = '\n\nCe concours a été annulé.';
  } else if (!active) {
    title = giveaway.rerolls
      ? '🔄 Giveaway — nouveau tirage'
      : '🎉 Giveaway terminé';

    color = 0x57f287;

    result = winners.length
      ? `\n\nGagnant(s) : ${winners.map(id => `<@${id}>`).join(', ')}`
      : '\n\nAucun participant éligible : aucun gagnant.';
  }

  const giveawayEmbed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(
      `Lot : ${escapeMarkdown(giveaway.prize)}\n` +
      `Organisateur : <@${giveaway.hostId}>\n` +
      `Nombre de gagnants prévu : ${giveaway.winnerCount}\n` +
      `Participations enregistrées : ${giveaway.participants.length}\n` +
      (
        active
          ? `Fin : <t:${timestamp}:R> — <t:${timestamp}:f>`
          : `Fin prévue : <t:${timestamp}:f>`
      ) +
      result
    )
    .setFooter({
      text: giveaway.messageId
        ? `ID du giveaway : ${giveaway.messageId}`
        : 'Clique sur le bouton pour participer.',
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(BUTTON_ID)
      .setLabel(
        active
          ? 'Participer / Se retirer'
          : cancelled
            ? 'Giveaway annulé'
            : 'Giveaway terminé'
      )
      .setEmoji('🎉')
      .setStyle(active ? ButtonStyle.Primary : ButtonStyle.Secondary)
      .setDisabled(!active)
  );

  const content = !active && !cancelled && winners.length
    ? `🎉 Félicitations ${winners.map(id => `<@${id}>`).join(', ')} !`
    : '';

  return {
    content,
    embeds: [giveawayEmbed],
    components: [row],
    allowedMentions: {
      parse: [],
      users: !active && !cancelled ? winners : [],
    },
  };
}

async function updateMessage(client, giveaway) {
  const channel = await client.channels.fetch(giveaway.channelId);

  if (!channel?.isTextBased() || !channel.messages) {
    throw new Error('Le salon du giveaway est introuvable ou inaccessible.');
  }

  const message = await channel.messages.fetch(giveaway.messageId);

  await message.edit(payload(giveaway));
  commit({ ...giveaway, pendingUpdate: false });
}

async function tryUpdate(client, giveaway) {
  try {
    await updateMessage(client, giveaway);
    return true;
  } catch (error) {
    console.error(`[GIVEAWAY UPDATE ${giveaway.messageId}]`, error);

    if ([10003, 10008].includes(Number(error.code))) {
      commit({ ...giveaway, pendingUpdate: false });
    }

    return false;
  }
}

async function eligibleParticipants(client, giveaway, excluded = []) {
  const guild = await client.guilds.fetch(giveaway.guildId);
  const excludedIds = new Set(excluded);

  const ids = [...new Set(giveaway.participants)]
    .filter(id => !excludedIds.has(id));

  const eligible = [];

  for (let i = 0; i < ids.length; i += 5) {
    const members = await Promise.all(
      ids.slice(i, i + 5).map(async id => {
        try {
          return await guild.members.fetch({
            user: id,
            force: true,
          });
        } catch (error) {
          if (Number(error.code) === 10007) return null;
          throw error;
        }
      })
    );

    for (const member of members) {
      if (member && !member.user.bot) eligible.push(member.id);
    }
  }

  return eligible;
}

function draw(ids, count) {
  const pool = [...ids];
  const winners = [];

  while (pool.length && winners.length < count) {
    const index = randomInt(pool.length);
    winners.push(pool.splice(index, 1)[0]);
  }

  return winners;
}

async function finishUnlocked(client, giveaway) {
  if (giveaway.status !== 'active') {
    throw new Error('Ce giveaway est déjà terminé ou annulé.');
  }

  const eligible = await eligibleParticipants(client, giveaway);
  const winners = draw(eligible, giveaway.winnerCount);

  const updated = commit({
    ...giveaway,
    status: 'ended',
    endedAt: Date.now(),
    winners,
    winnerHistory: winners,
    pendingUpdate: true,
  });

  const published = await tryUpdate(client, updated);
  return { giveaway: updated, published };
}

async function create(message, duration, winnerCount, prize) {
  if (!message.guild) {
    throw new Error('Cette commande doit être utilisée sur un serveur.');
  }

  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    throw new Error('Tu dois avoir la permission Gérer les messages.');
  }

  const botMember = message.guild.members.me
    || await message.guild.members.fetchMe();

  const permissions = message.channel.permissionsFor(botMember);
  const required = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.ReadMessageHistory,
  ];

  if (!permissions?.has(required)) {
    throw new Error(
      'Il me faut les permissions Voir le salon, Envoyer des messages, ' +
      'Intégrer des liens et Voir les anciens messages.'
    );
  }

  init(message.client);

  const giveaway = {
    messageId: null,
    guildId: message.guild.id,
    channelId: message.channel.id,
    hostId: message.author.id,
    prize,
    winnerCount,
    endsAt: Date.now() + duration,
    status: 'active',
    participants: [],
    winners: [],
    winnerHistory: [],
    rerolls: 0,
    pendingUpdate: true,
  };

  const sent = await message.channel.send(payload(giveaway));
  giveaway.messageId = sent.id;

  try {
    commit(giveaway);
  } catch (error) {
    await sent.delete().catch(() => {});
    throw error;
  }

  await exclusive(sent.id, () => tryUpdate(message.client, giveaway));

  return sent;
}

async function handleButton(interaction) {
  if (!interaction.isButton() || interaction.customId !== BUTTON_ID) {
    return false;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    if (!interaction.guildId) {
      throw new Error('Cette interaction doit être utilisée sur un serveur.');
    }

    await exclusive(interaction.message.id, async () => {
      const giveaway = get(interaction.message.id, interaction.guildId);

      if (giveaway.channelId !== interaction.channelId) {
        throw new Error('Ce bouton ne correspond pas au salon du giveaway.');
      }

      if (giveaway.status !== 'active' || Date.now() >= giveaway.endsAt) {
        throw new Error('Ce giveaway est terminé.');
      }

      if (interaction.user.bot) {
        throw new Error('Les bots ne peuvent pas participer.');
      }

      const alreadyEntered = giveaway.participants.includes(interaction.user.id);

      const participants = alreadyEntered
        ? giveaway.participants.filter(id => id !== interaction.user.id)
        : [...giveaway.participants, interaction.user.id];

      commit({
        ...giveaway,
        participants,
        pendingUpdate: true,
      });

      await interaction.editReply({
        content: alreadyEntered
          ? '✅ Ta participation a été retirée.'
          : '🎉 Ta participation a été enregistrée !',
      });
    });
  } catch (error) {
    await interaction.editReply({
      content: `❌ ${error.message}`,
    });
  }

  return true;
}

async function manage(client, id, guildId, action) {
  return exclusive(id, async () => {
    const giveaway = get(id, guildId);

    if (action === 'end') {
      return finishUnlocked(client, giveaway);
    }

    if (action === 'cancel') {
      if (giveaway.status !== 'active') {
        throw new Error('Seul un giveaway en cours peut être annulé.');
      }

      const updated = commit({
        ...giveaway,
        status: 'cancelled',
        endedAt: Date.now(),
        pendingUpdate: true,
      });

      const published = await tryUpdate(client, updated);
      return { giveaway: updated, published };
    }

    if (action === 'reroll') {
      if (giveaway.status !== 'ended') {
        throw new Error('Il faut terminer le giveaway avant de refaire un tirage.');
      }

      const eligible = await eligibleParticipants(
        client,
        giveaway,
        giveaway.winnerHistory || giveaway.winners
      );

      if (!eligible.length) {
        throw new Error('Aucun nouveau participant éligible à tirer.');
      }

      const winners = draw(eligible, giveaway.winnerCount);

      const updated = commit({
        ...giveaway,
        winners,
        winnerHistory: [
          ...new Set([
            ...(giveaway.winnerHistory || giveaway.winners),
            ...winners,
          ]),
        ],
        rerolls: (giveaway.rerolls || 0) + 1,
        pendingUpdate: true,
      });

      const published = await tryUpdate(client, updated);
      return { giveaway: updated, published };
    }

    throw new Error('Action inconnue.');
  });
}

function managementCommand(action) {
  const definitions = {
    end: {
      name: 'gend',
      aliases: ['giveawayend'],
      description: 'Termine un giveaway et tire les gagnants.',
      success: 'Le giveaway a été terminé.',
    },
    reroll: {
      name: 'greroll',
      aliases: ['giveawayreroll'],
      description: 'Tire de nouveaux gagnants pour un giveaway terminé.',
      success: 'Un nouveau tirage a été effectué.',
    },
    cancel: {
      name: 'gcancel',
      aliases: ['giveawaycancel'],
      description: 'Annule un giveaway sans tirer de gagnants.',
      success: 'Le giveaway a été annulé.',
    },
  };

  const definition = definitions[action];

  return {
    name: definition.name,
    aliases: definition.aliases,
    description: definition.description,
    usage: `${definition.name} <ID|lien du message>`,
    category: 'Giveaway',
    userPerms: [PermissionFlagsBits.ManageMessages],
    botPerms: [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
    ],

    async execute(message, args) {
      try {
        if (!message.guild) {
          throw new Error('Cette commande doit être utilisée sur un serveur.');
        }

        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
          throw new Error('Tu dois avoir la permission Gérer les messages.');
        }

        const id = parseMessageId(args[0], message.guild.id);

        if (!id) {
          throw new Error(
            `Utilisation : ${definition.name} <ID|lien du message>`
          );
        }

        init(message.client);

        const result = await manage(
          message.client,
          id,
          message.guild.id,
          action
        );

        const publicationNote = result.published
          ? ''
          : '\nLa sauvegarde est effectuée, mais le message Discord ' +
            'n’a pas pu être mis à jour. Vérifie les logs et les permissions.';

        return message.reply({
          embeds: [
            embed.success(
              'Giveaway',
              definition.success + publicationNote
            ),
          ],
          allowedMentions: { parse: [] },
        });
      } catch (error) {
        console.error(`[GIVEAWAY ${action.toUpperCase()}]`, error);

        return message.reply({
          embeds: [embed.error('Erreur', error.message)],
          allowedMentions: { parse: [] },
        });
      }
    },
  };
}

function init(client) {
  if (initializedClients.has(client)) return;
  initializedClients.add(client);

  let running = false;

  async function tick() {
    if (!client.isReady() || running) return;
    running = true;

    try {
      for (const snapshot of Object.values(records)) {
        const due = snapshot.status === 'active'
          && snapshot.endsAt <= Date.now();

        if ((!due && !snapshot.pendingUpdate) || locks.has(snapshot.messageId)) {
          continue;
        }

        try {
          await exclusive(snapshot.messageId, async () => {
            const current = records[snapshot.messageId];

            if (
              current.status === 'active'
              && current.endsAt <= Date.now()
            ) {
              await finishUnlocked(client, current);
            } else if (current.pendingUpdate) {
              await tryUpdate(client, current);
            }
          });
        } catch (error) {
          console.error(
            `[GIVEAWAY CHECK ${snapshot.messageId}]`,
            error
          );
        }
      }
    } finally {
      running = false;
    }
  }

  const interval = setInterval(() => {
    tick().catch(error => console.error('[GIVEAWAY TIMER]', error));
  }, 15_000);

  interval.unref();

  tick().catch(error => console.error('[GIVEAWAY INIT]', error));
}

module.exports = {
  init,
  create,
  handleButton,
  parseDuration,
  managementCommand,
};
