const reactionRoleManager = require("../managers/reactionRole.manager");
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = (client) => {

  // =============================
  // TIME PARSER
  // =============================
  function parseTime(time) {
    if (!time) return 60000;

    const match = time.toString().match(/(\d+)([smhd])/);
    if (!match) return 60000;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s": return value * 1000;
      case "m": return value * 60000;
      case "h": return value * 3600000;
      case "d": return value * 86400000;
      default: return 60000;
    }
  }

  // =============================
  // INTERACTIONS
  // =============================
  client.on("interactionCreate", async (interaction) => {
    try {
      // 🔥 REACTION ROLE SYSTEM
      if (await reactionRoleManager.handle(interaction)) return;

      // =============================
      // SLASH COMMANDS
      // =============================
      if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);

        if (!cmd) {
          return interaction.reply({ content: "❌ Command not found", flags: 64 });
        }

        try {
          await cmd.execute(interaction, client);
        } catch (err) {
          console.error(`❌ COMMAND ERROR (${interaction.commandName}):`, err);

          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: "❌ Error executing command" }).catch(() => {});
          } else {
            await interaction.reply({ content: "❌ Error executing command", flags: 64 }).catch(() => {});
          }
        }

        return;
      }

      // =============================
      // 🎫 STRING SELECT (TICKETS)
      // =============================
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId === "ticket_create") {
          const ticketManager = require("../managers/ticket.manager");
          return ticketManager.createTicket(interaction, interaction.values[0]);
        }
      }

      // =============================
      // 🎭 ROLE SELECT (PANELS)
      // =============================
      if (interaction.isRoleSelectMenu()) {
        if (interaction.customId === "panel_roles_select") {
          const ticketManager = require("../managers/ticket.manager");
          return ticketManager.handleRoleSelect(interaction);
        }
      }

      // =============================
      // 🎁 GIVEAWAY MODALS
      // =============================
      if (interaction.isModalSubmit()) {
        const data = client.tempGiveaways.get(interaction.user.id);

        if (!data) {
          return interaction.reply({ content: "❌ No active giveaway!", flags: 64 });
        }

        if (interaction.customId === "gw_modal_prize") {
          data.prize = interaction.fields.getTextInputValue("prize");
        }

        if (interaction.customId === "gw_modal_time") {
          data.time = interaction.fields.getTextInputValue("time");
        }

        if (interaction.customId === "gw_modal_winner") {
          data.winners = parseInt(interaction.fields.getTextInputValue("winner"));
        }

        return interaction.reply({ content: "✅ Saved!", flags: 64 });
      }

      // =============================
      // 🔘 BUTTONS
      // =============================
      if (interaction.isButton()) {

        // 🎉 JOIN GIVEAWAY
        if (interaction.customId.startsWith("gw_join_")) {
          const gw = client.activeGiveaways.get(interaction.message.id);

          if (!gw) return interaction.reply({ content: "❌ Giveaway not found", flags: 64 });
          if (Date.now() > gw.endAt) return interaction.reply({ content: "❌ Giveaway ended!", flags: 64 });
          if (gw.users.includes(interaction.user.id)) return interaction.reply({ content: "❌ You are already participating!", flags: 64 });

          gw.users.push(interaction.user.id);
          const count = gw.users.length;

          const embed = interaction.message.embeds[0].data;
          const newFields = embed.fields.map(f => f.name === "👥 Total Entries" ? { ...f, value: `${count}` } : f);

          await interaction.update({
            embeds: [{ ...embed, fields: newFields }],
            components: [{
              type: 1,
              components: [{ type: 2, label: `🎉 Participate (${count})`, style: 1, custom_id: interaction.customId }]
            }]
          });

          return;
        }

        // 🎲 REROLL
        if (interaction.customId.startsWith("gw_reroll_")) {
          const msgId = interaction.customId.split("_")[2];
          const gw = client.activeGiveaways.get(msgId);

          if (!gw) return interaction.reply({ content: "❌ Giveaway not found", flags: 64 });

          const winners = gw.users.sort(() => 0.5 - Math.random()).slice(0, gw.winners);
          const text = winners.length ? winners.map(u => `<@${u}>`).join("\n") : "No one";

          return interaction.reply({ content: `🎲 New Winners:\n${text}` });
        }

        // 🎁 SETUP BUTTONS
        const data = client.tempGiveaways.get(interaction.user.id);

        if (interaction.customId === "gw_set_prize") {
          const modal = new ModalBuilder().setCustomId("gw_modal_prize").setTitle("Prize");
          const input = new TextInputBuilder().setCustomId("prize").setLabel("Prize").setStyle(TextInputStyle.Short);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          return interaction.showModal(modal);
        }

        if (interaction.customId === "gw_set_time") {
          const modal = new ModalBuilder().setCustomId("gw_modal_time").setTitle("Time");
          const input = new TextInputBuilder().setCustomId("time").setLabel("1s = 1 second / 1m = 1 minute / 1h = 1 hour").setStyle(TextInputStyle.Short);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          return interaction.showModal(modal);
        }

        if (interaction.customId === "gw_set_winner") {
          const modal = new ModalBuilder().setCustomId("gw_modal_winner").setTitle("Winners");
          const input = new TextInputBuilder().setCustomId("winner").setLabel("Number of Winners").setStyle(TextInputStyle.Short);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          return interaction.showModal(modal);
        }

        if (interaction.customId === "gw_start") {
          if (!data || !data.prize || !data.time || !data.winners) {
            return interaction.reply({ content: "❌ Setup unvollständig!", flags: 64 });
          }

          const endTime = Date.now() + parseTime(data.time);
          const timestamp = Math.floor(endTime / 1000);

          const embed = {
            title: "🎁 Giveaway",
            description: `**${data.prize}**\nParticipate below!`,
            color: 0xa855f7,
            fields: [
              { name: "👑 Host", value: `<@${interaction.user.id}>`, inline: true },
              { name: "🏆 Winners", value: `${data.winners}`, inline: true },
              { name: "👥 Total Entries", value: "0", inline: true },
              { name: "⏰ Ends", value: `<t:${timestamp}:R>`, inline: false }
            ]
          };

          const msg = await interaction.channel.send({
            embeds: [embed],
            components: [{ type: 1, components: [{ type: 2, label: "🎉 Participate (0)", style: 1, custom_id: `gw_join_${Date.now()}` }] }]
          });

          client.activeGiveaways.set(msg.id, {
            users: [],
            winners: data.winners,
            host: interaction.user.id,
            endAt: endTime
          });

          setTimeout(async () => {
            const gw = client.activeGiveaways.get(msg.id);
            if (!gw) return;

            const winners = gw.users.sort(() => 0.5 - Math.random()).slice(0, gw.winners);
            const text = winners.length ? winners.map(u => `<@${u}>`).join("\n") : "No one";

            await msg.edit({ content: "🎉 Giveaway ended!", components: [] });
            await interaction.channel.send(`🎉 Winners:\n${text}`);

            client.activeGiveaways.delete(msg.id);
          }, parseTime(data.time));

          client.tempGiveaways.delete(interaction.user.id);
          return interaction.reply({ content: "✅ Giveaway started!", flags: 64 });
        }

        // 🎫 TICKET BUTTONS
        const ticketManager = require("../managers/ticket.manager");

        if (interaction.customId === "ticket_close") return ticketManager.closeTicket(interaction);
        if (interaction.customId === "ticket_settings") return ticketManager.openSettings(interaction);
        if (interaction.customId === "ticket_rename") return ticketManager.showRenameMenu(interaction);
        if (interaction.customId.startsWith("rename_")) return ticketManager.applyRename(interaction);
        if (interaction.customId === "panel_settings") return ticketManager.openPanelSettings(interaction);
        if (interaction.customId === "panel_roles") return ticketManager.openRoleSelect(interaction);
        if (interaction.customId === "panel_category") return ticketManager.openCategorySelect(interaction);
        if (interaction.customId === "panel_status_category") return ticketManager.openStatusCategoryMenu(interaction);
        if (interaction.customId.startsWith("set_")) return ticketManager.askCategorySelect(interaction);
      }

      // =============================
      // CHANNEL SELECT
      // =============================
      if (interaction.isChannelSelectMenu()) {
        const ticketManager = require("../managers/ticket.manager");

        if (interaction.customId.startsWith("statuscat_")) {
          return ticketManager.handleStatusCategory(interaction);
        }

        if (interaction.customId === "panel_category_select") {
          return ticketManager.handleCategorySelect(interaction);
        }
      }

    } catch (err) {
      console.error("🔥 GLOBAL ERROR:", err);

      if (!interaction.replied && !interaction.deferred) {
        interaction.reply({ content: "❌ An error occurred", flags: 64 }).catch(() => {});
      }
    }
  });
};