const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");

class ReactionRoleManager {

  async handle(interaction) {

    // ================= PANEL ERSTELLEN =================
    if (interaction.isRoleSelectMenu()) {

      if (interaction.customId !== "rr_create") return false;

      await interaction.deferReply({ flags: 64 });

      try {
        const roles = interaction.values;

        const options = roles.map(roleId => {
          const role = interaction.guild.roles.cache.get(roleId);
          if (!role) return null;

          return {
            label: role.name,
            value: role.id
          };
        }).filter(Boolean);

        if (options.length === 0) {
          await interaction.editReply({
            content: "❌ No valid roles selected!"
          });
          return true;
        }

        const encoded = roles.join(",");

        const menu = new StringSelectMenuBuilder()
          .setCustomId(`rr_select_${encoded}`)
          .setPlaceholder("Choose your roles")
          .setMinValues(0)
          .setMaxValues(options.length)
          .addOptions(options);

        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
          .setTitle("🎭 Role Selection")
          .setDescription("Choose your roles by selecting them from the dropdown menu below!")
          .setColor("Purple")

        await interaction.channel.send({
          embeds: [embed],
          components: [row]
        });

        await interaction.editReply({
          content: "✅ Panel created successfully!"
        });

      } catch (err) {
        console.error("RR CREATE ERROR:", err);

        await interaction.editReply({
          content: "❌ Error creating the panel (Bot role too low?)"
        });
      }

      return true;
    }

// ================= ROLLEN HANDLING =================
if (interaction.isStringSelectMenu()) {

  if (!interaction.customId.startsWith("rr_select_")) return false;

  const member = interaction.member;
  if (!member) return true;

  await interaction.deferUpdate();

  try {
    const raw = interaction.customId.replace("rr_select_", "");
    const allRoles = raw.split(",");
    const selected = interaction.values;

    let added = [];
    let removed = [];

    // ➕ Rollen hinzufügen
    for (const roleId of selected) {
      if (!member.roles.cache.has(roleId)) {
        await member.roles.add(roleId).catch(() => {});
        added.push(roleId);
      }
    }

    // ➖ Rollen entfernen
    for (const roleId of allRoles) {
      if (!selected.includes(roleId) && member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId).catch(() => {});
        removed.push(roleId);
      }
    }

    // 🔥 FEEDBACK BAUEN
    let msg = "";

    if (added.length > 0) {
      msg += `✅ Received: ${added.map(r => `<@&${r}>`).join(", ")}\n`;
    }

    if (removed.length > 0) {
      msg += `❌ Removed: ${removed.map(r => `<@&${r}>`).join(", ")}`;
    }

    if (!msg) {
      msg = "ℹ️ No changes were made to your roles - your already had the selected role/s";
    }

    await interaction.followUp({
      content: msg,
      flags: 64
    });

  } catch (err) {
    console.error("RR UPDATE ERROR:", err);

    await interaction.followUp({
      content: "⚠️ Error (Bot role too low?)",
      flags: 64
    });
  }

  return true;
}

    return false;
  }
}

module.exports = new ReactionRoleManager();