const { EmbedBuilder } = require("discord.js");

class EmbedService {
  static create(data = {}) {
    const embed = new EmbedBuilder()
      .setTitle(data.title || null)
      .setDescription(data.description || null)
      .setColor(data.color || 0x2b2d31);

    if (data.fields) embed.addFields(data.fields);
    if (data.thumbnail) embed.setThumbnail(data.thumbnail);
    if (data.image) embed.setImage(data.image);
    if (data.footer) embed.setFooter({ text: data.footer });
    if (data.timestamp) embed.setTimestamp();

    return embed;
  }
}

module.exports = EmbedService;