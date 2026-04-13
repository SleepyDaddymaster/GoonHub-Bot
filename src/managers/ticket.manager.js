const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType: DiscordChannelType
} = require("discord.js");

const tickets = new Map();

const panelConfig = {
  accessRoles: [],
  categoryId: null,
  statusCategories: {
    progress: null,
    closed: null,
    done: null
  }
};

module.exports = {

  // ================= CREATE =================
  async createTicket(interaction, type) {
    const guild = interaction.guild;
    const user = interaction.user;

    if (!tickets.has(user.id)) tickets.set(user.id, {});
    const userTickets = tickets.get(user.id);

    if (userTickets[type]) {
      return interaction.reply({
        content: `❌ Du hast bereits ein **${type}** Ticket!`,
        flags: 64
      });
    }

    const channel = await guild.channels.create({
      name: `${type}-${user.username}`,
      type: ChannelType.GuildText,
      parent: panelConfig.categoryId || null,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ...panelConfig.accessRoles.map(roleId => ({
          id: roleId,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }))
      ]
    });

    userTickets[type] = channel.id;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("ticket_close").setLabel("Schließen").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("ticket_settings").setEmoji("⚙️").setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      content: `<@${user.id}>`,
      components: [row]
    });

    await interaction.reply({
      content: `✅ Ticket erstellt: ${channel}`,
      flags: 64
    });
  },

  // ================= CLOSE =================
  async closeTicket(interaction) {

    await interaction.reply({
      content: "🔒 Ticket wird geschlossen...",
      flags: 64
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  },

  // ================= SETTINGS =================
  async openSettings(interaction) {

    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: "❌ Nur Admins!",
        flags: 64
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("ticket_rename").setLabel("✏️ Status").setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: "⚙️ Ticket Einstellungen:",
      components: [row],
      flags: 64
    });
  },

  // ================= STATUS MENU =================
  async showRenameMenu(interaction) {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("rename_progress").setLabel("🟡 In Bearbeitung").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("rename_closed").setLabel("🔴 Geschlossen").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("rename_done").setLabel("🟢 Erledigt").setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      content: "Status wählen:",
      components: [row],
      flags: 64
    });
  },

  // ================= APPLY STATUS =================
  async applyRename(interaction) {

    const type = interaction.customId.split("_")[1];
    const username = interaction.user.username;

    let prefix = "ticket";
    if (type === "progress") prefix = "in-progress";
    if (type === "closed") prefix = "closed";
    if (type === "done") prefix = "done";

    const newCategory = panelConfig.statusCategories[type];

    if (newCategory) {
      await interaction.channel.setParent(newCategory);
    }

    await interaction.channel.setName(`${prefix}-${username}`);

    await interaction.reply({
      content: `✅ ${prefix}-${username}`,
      flags: 64
    });
  },

  // ================= PANEL SETTINGS =================
  async openPanelSettings(interaction) {

    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: "❌ Nur Admins!",
        flags: 64
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("panel_roles").setLabel("👮 Ticket-Admin Roles").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("panel_category").setLabel("📂 Ticket Start category").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("panel_status_category").setLabel("📊 Status categorys").setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: "⚙️ Panel Einstellungen:",
      components: [row],
      flags: 64
    });
  },

  // ================= STATUS CATEGORY =================
  async openStatusCategoryMenu(interaction) {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("set_progress_cat").setLabel("🟡 Progress Category").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("set_closed_cat").setLabel("🔴 Closed Category").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("set_done_cat").setLabel("🟢 Done Category").setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: "📊 Choose a category:",
      components: [row],
      flags: 64
    });
  },

  async askCategorySelect(interaction) {

    const type = interaction.customId.split("_")[1];

    const menu = new ChannelSelectMenuBuilder()
      .setCustomId(`statuscat_${type}`)
      .addChannelTypes(DiscordChannelType.GuildCategory);

    await interaction.reply({
      content: "Choose a category:",
      components: [new ActionRowBuilder().addComponents(menu)],
      flags: 64
    });
  },

  async handleStatusCategory(interaction) {

    const type = interaction.customId.split("_")[1];

    panelConfig.statusCategories[type] = interaction.values[0];

    await interaction.reply({
      content: `✅ Category for ${type} set`,
      flags: 64
    });
  },

  // ================= ROLES =================
  async openRoleSelect(interaction) {

    const menu = new RoleSelectMenuBuilder()
      .setCustomId("panel_roles_select");

    await interaction.reply({
      content: "Choose roles:",
      components: [new ActionRowBuilder().addComponents(menu)],
      flags: 64
    });
  },

  async handleRoleSelect(interaction) {
    panelConfig.accessRoles = interaction.values;

    await interaction.reply({
      content: "✅ Roles saved",
      flags: 64
    });
  },

  // ================= START CATEGORY =================
  async openCategorySelect(interaction) {

    const menu = new ChannelSelectMenuBuilder()
      .setCustomId("panel_category_select")
      .addChannelTypes(DiscordChannelType.GuildCategory);

    await interaction.reply({
      content: "Start category choose:",
      components: [new ActionRowBuilder().addComponents(menu)],
      flags: 64
    });
  },

  async handleCategorySelect(interaction) {
    panelConfig.categoryId = interaction.values[0];

    await interaction.reply({
      content: "✅ Start category set",
      flags: 64
    });
  }

};