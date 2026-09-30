const { EmbedBuilder } = require('discord.js');
const config = require('../config');

function format(text, vars = {}) {
  const all = { botName: config.botName, developer: config.developer, prefix: config.prefix, ...vars };
  return String(text ?? '').replace(/\{(\w+)\}/g, (m, key) => (key in all ? all[key] : m));
}

function isValidHex(color) {
  return typeof color === 'string' && /^#?[0-9a-fA-F]{6}$/.test(color.trim());
}

function toColor(color, fallback = config.colors.main) {
  if (!isValidHex(color)) return fallback;
  const c = color.trim();
  return c.startsWith('#') ? c : `#${c}`;
}

function base(color, opts = {}) {
  const e = new EmbedBuilder().setColor(toColor(color));

  const footer = { text: format(opts.footerText ?? config.embeds.footerText) };
  if (opts.footerIcon ?? config.embeds.footerIcon) footer.iconURL = opts.footerIcon ?? config.embeds.footerIcon;
  if (footer.text) e.setFooter(footer);

  if (config.embeds.timestamp) e.setTimestamp();
  return e;
}

const titled = (color, emoji) => (title, description) =>
  base(color)
    .setTitle(`${emoji ? emoji + ' ' : ''}${title}`)
    .setDescription(description);

const embed = {
  success: titled(config.colors.success, config.emojis.success),
  error:   titled(config.colors.error,   config.emojis.error),
  warning: titled(config.colors.warning, config.emojis.warning),
  info:    titled(config.colors.info,    config.emojis.info),
  mod:     titled(config.colors.main,    config.emojis.mod),

  custom: (color = config.colors.main, opts) => base(color, opts),

  format,
  isValidHex,
  toColor,
};

module.exports = embed;
