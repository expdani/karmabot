import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  User,
} from "discord.js";
import { getCurrency } from "../../../apollo/currency";
import { CURRENCY_SIGN } from "../../../types/currency";
import { startCollector } from "./collector";

/**
 * Ask player if it wants to play.
 */
export default async function sendRequest(
  interaction: CommandInteraction,
  author: User,
  targetUser: User,
  bet: any
) {
  const user = interaction.user;

  if (bet) {
    const authorWallet = (await getCurrency(author.id)).wallet;
    if (authorWallet < bet)
      return interaction.reply({
        content: "You don't have enough money in your wallet.",
      });
  }

  let string = `<@${targetUser.id}>, <@${user.id}> is challenging you for a game!`;
  if (bet) string += `\n**Bet: ${CURRENCY_SIGN}${bet}**!`;

  const embed = new EmbedBuilder()
    .setTitle("**Tic Tac Toe**")
    .setDescription(string)
    .setColor("#fffff");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("accept")
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("decline")
      .setLabel("Decline")
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
  });

  /**
   * Only handle interaction if user is target.
   */
  const filter = (i: any) => i.user.id === targetUser.id;
  const collector = interaction.channel?.createMessageComponentCollector({
    filter,
    time: 60 * 1000,
  });

  collector.on("collect", async (i) => {
    if (!i.isButton) return;
    await i.deferUpdate();

    if (i.customId === "accept") {
      collector.stop("accept");
      const targetWallet = (await getCurrency(targetUser.id)).wallet;

      if (bet) {
        if (targetWallet >= bet) startCollector(i, author, targetUser, bet);
        else {
          const embed = new EmbedBuilder()
            .setTitle("**Tic Tac Toe**")
            .setDescription(
              `<@${targetUser.id}> does not have enough money to bet ${CURRENCY_SIGN}${bet}.`
            )
            .setColor("#fffff");

          i.editReply({ content: null, embeds: [embed], components: [] });
        }
      } else {
        startCollector(i, author, targetUser, bet);
      }
    } else {
      await collector.stop("decline");
      const embed = new EmbedBuilder()
        .setTitle("**Tic Tac Toe**")
        .setDescription(`<@${targetUser.id}> declined.`)
        .setColor("#fffff");

      i.editReply({ embeds: [embed], components: [] });
    }
  });

  collector.on("end", async (_collected: any, reason: string) => {
    if (reason === "time") {
      const embed = new EmbedBuilder()
        .setTitle("**Tic Tac Toe**")
        .setDescription(`<@${targetUser.id}> didn't reply.`)
        .setColor("#fffff");

      interaction.editReply({ content: null, embeds: [embed], components: [] });
    }
  });
}
