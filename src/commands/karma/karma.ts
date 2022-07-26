import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getKarma, getServerKarmaLeaderboard } from "../../apollo/karma";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("karma")
    .setDescription("Get karma from a user or show the server leaderboard!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Get your own or someone else's karma.")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("Leave empty to show your own karma.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leaderboard")
        .setDescription("Shows you the server leaderboard.")
    ),

  execute: async (interaction: any) => {
    if (interaction.options.getSubcommand() === "leaderboard") {
      const embed = new EmbedBuilder()
        .setTitle("Leaderboard")
        .setColor("#fffff");

      const leaderboard = await getServerKarmaLeaderboard(interaction.guild.id);

      if (leaderboard.length < 1)
        return interaction.reply({
          embeds: [embed.setDescription("It's empty here..")],
        });

      let i = 0;

      leaderboard.forEach((lb) => {
        i++;
        embed.addFields({
          name: lb.total.toString(),
          value: `${i}. <@${lb.user_id}>`,
          inline: true,
        });
      });

      return interaction.reply({ embeds: [embed] });
    } else {
      const user = interaction.options.getUser("member") || interaction.user;

      const karma = await getKarma(user.id, interaction.guild.id);

      const embed = new EmbedBuilder()
        .setAuthor({
          name: user.username,
          iconURL: `${user.avatarURL() ?? "https://i.imgur.com/ZOKp8LH.jpg"}`,
          url: `${user.avatarURL() ?? "https://i.imgur.com/ZOKp8LH.jpg"}`,
        })
        .addFields({ name: "Karma", value: karma.total.toString(), inline: false })
        .setColor("#fffff");

      return interaction.reply({ embeds: [embed] });
    }
  },
};
