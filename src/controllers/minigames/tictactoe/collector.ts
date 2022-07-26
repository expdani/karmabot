import { EmbedBuilder, User } from "discord.js";
import { changeCurrency } from "../../../apollo/currency";
import { CURRENCY_SIGN, CURRENCY_TYPE } from "../../../types/currency";
import { sendTicTacToe, updateGrid } from "./grid";

export type TttType = {
  turn: User;
  author: User;
  targetUser: User;
  bet: number;
  winner?: User;
};

/**
 * Start collector
 */
export async function startCollector(
  interaction: any,
  author: User,
  targetUser: User,
  bet: any
) {
  const game: TttType = {
    turn: targetUser,
    author: author,
    targetUser: targetUser,
    bet: bet,
  };

  await sendTicTacToe(interaction, game);

  /**
   * Only handle interaction if user is author or target.
   */
  const filter = (i: any) =>
    i.user.id === targetUser.id || i.user.id === author.id;
  const collector = interaction.channel?.createMessageComponentCollector({
    filter,
    time: 60 * 1000,
  });

  if (bet) {
    await changeCurrency(author.id, CURRENCY_TYPE.WALLET, -bet);
    await changeCurrency(targetUser.id, CURRENCY_TYPE.WALLET, -bet);
  }

  collector.on("collect", async (i: any) => {
    handleInteraction(i, collector, game);
  });

  collector.on("end", async (_collected: any, reason: string) => {
    if (reason === "time") {
      handleTimeout(interaction, game);
    }
  });
}

/**
 * Handle an interaction
 */
async function handleInteraction(i: any, collector: any, game: TttType) {
  try {
    if (!i.isButton()) return;
    await i.deferUpdate();

    if (i.user.id === game.turn.id) {
      game.turn =
        game.turn.id === game.author.id ? game.targetUser : game.author;
      await updateGrid(i, collector, game);
    }
  } catch (err) {
    i.channel?.send("Oops, something went wrong processing your action.");
  }
}

/**
 * Handle timeout
 */
async function handleTimeout(interaction: any, game: TttType) {
  const winner = game.turn === game.targetUser ? game.author : game.targetUser;
  const loser = winner === game.targetUser ? game.author : game.targetUser;

  await changeCurrency(winner.id, CURRENCY_TYPE.WALLET, game.bet *2)
  const embed = new EmbedBuilder()
    .setTitle("**Tic Tac Toe**")
    .setDescription(
      `<@${loser.id}> timed out${
        game.bet
          ? `\n<@${winner?.id}> won the bet of ${CURRENCY_SIGN}${game.bet}`
          : ""
      }`
    )
    .setColor("#fffff");

  interaction.editReply({ embeds: [embed], components: [] });
}
