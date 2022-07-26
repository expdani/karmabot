import { EmbedBuilder } from "@discordjs/builders";
import {
  ButtonStyle,
  CommandInteraction,
  InteractionType,
  User,
} from "discord.js";
import { changeCurrency } from "../../../apollo/currency";
import { disableAllButtons, enableAllButtons } from "../../../helpers";
import { CURRENCY_TYPE } from "../../../types/currency";
import { CURRENCY_SIGN } from "../../../types/currency";
import { TttType } from "./collector";

/**
 * Send grid and save game to cache.
 */
export async function sendTicTacToe(
  interaction: CommandInteraction,
  game: TttType
) {
  let string = `**<@${game.turn.id}>'s turn!**`;
  if (game.bet) string += `\nBet: ${CURRENCY_SIGN}${game.bet}`;
  const embed = new EmbedBuilder()
    .setTitle("**Tic Tac Toe**")
    .setDescription(`${string}`)
    .setFooter({
      text: `${game.author.tag} vs ${game.targetUser.tag}\n/help tictactoe`,
    });

  const components = [
    {
      type: 1,
      components: [
        { type: 2, label: "_", style: 2, custom_id: "ttt11" },
        { type: 2, label: "_", style: 2, custom_id: "ttt12" },
        { type: 2, label: "_", style: 2, custom_id: "ttt13" },
      ],
    },
    {
      type: 1,
      components: [
        { type: 2, label: "_", style: 2, custom_id: "ttt21" },
        { type: 2, label: "_", style: 2, custom_id: "ttt22" },
        { type: 2, label: "_", style: 2, custom_id: "ttt23" },
      ],
    },
    {
      type: 1,
      components: [
        { type: 2, label: "_", style: 2, custom_id: "ttt31" },
        { type: 2, label: "_", style: 2, custom_id: "ttt32" },
        { type: 2, label: "_", style: 2, custom_id: "ttt33" },
      ],
    },
  ];

  interaction.editReply({
    content: null,
    embeds: [embed],
    components: components,
  });
}

/**
 * Update a grid
 */
export async function updateGrid(
  interaction: any,
  collector: any,
  game: TttType
) {
  try {
    if (interaction.type != InteractionType.MessageComponent) return;
    const message = interaction.message;

    if (!interaction.isButton()) return;
    if (!message.components) return;

    const i = parseInt(interaction.customId[3]);
    const j = parseInt(interaction.customId[4]);

    const buttonPressed = message.components[i - 1].components[j - 1];

    if (buttonPressed.label !== "_") return;

    disableAllButtons(message);

    const components: any[] = [];

    for (const actionRow of message.components) {
      components.push({ type: 1, components: [] });
      for (const button of actionRow.components) {
        if (button.data.custom_id === buttonPressed.data.custom_id) {
          components[components.length - 1].components.push({
            type: 2,
            label: interaction.user.id === game.author.id ? "X" : "O",
            style:
              interaction.user.id === game.author.id
                ? ButtonStyle.Success
                : ButtonStyle.Danger,

            customId: button.customId,
          });
        } else {
          components[components.length - 1].components.push({
            type: 2,
            label: button.label,
            style: button.style,
            customId: button.customId,
          });
        }
      }
    }

    const string = `<@${game.author.id}> vs <@${game.targetUser.id}>\n<@${game.turn?.id}>'s turn!`;
    const embed = new EmbedBuilder()
      .setTitle("**Tic Tac Toe**")
      .setDescription(`${string}`);

    await message.edit({
      content: null,
      components: components,
      embeds: [embed],
    });

    checkWin(interaction, collector, game);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Check grid if there are 3 in a row.
 */
function isWinner(buttons: any, letter: string) {
  if (
    // horizontal
    (buttons[0].label === letter &&
      buttons[1].label === letter &&
      buttons[2].label === letter) ||
    (buttons[3].label === letter &&
      buttons[4].label === letter &&
      buttons[5].label === letter) ||
    (buttons[6].label === letter &&
      buttons[7].label === letter &&
      buttons[8].label === letter) ||
    // vertical
    (buttons[0].label === letter &&
      buttons[3].label === letter &&
      buttons[6].label === letter) ||
    (buttons[1].label === letter &&
      buttons[4].label === letter &&
      buttons[7].label === letter) ||
    (buttons[2].label === letter &&
      buttons[5].label === letter &&
      buttons[8].label === letter) ||
    // cross
    (buttons[0].label === letter &&
      buttons[4].label === letter &&
      buttons[8].label === letter) ||
    (buttons[6].label === letter &&
      buttons[4].label === letter &&
      buttons[2].label === letter)
  )
    return true;
}

/**
 * Check if there is a winner.
 */
async function checkWin(interaction: any, collector: any, game: TttType) {
  try {
    const message = interaction.message;
    if (!message.components) return;

    const buttons: { label: string; id: string }[] = [];
    let empty = 0;

    for (const actionRow of message.components) {
      for (const button of actionRow.components) {
        if (button.label === "_") empty++;
        buttons.push({
          label: button.label,
          id: button.customId as string,
        });
      }
    }

    const letter = interaction.user.id === game.author.id ? "X" : "O";

    if (!isWinner(buttons, letter) && empty === 0) {
      const string = "**Draw!**";
      const embed = new EmbedBuilder()
        .setTitle("**Tic Tac Toe**")
        .setDescription(`${string}`)
        .setFooter({
          text: `${game.author.tag} vs ${game.targetUser.tag}\n/help tictactoe`,
        });
      await message.edit({ embeds: [embed] });
      disableAllButtons(message);
      if (game.bet) {
        await changeCurrency(
          game.author.id,
          CURRENCY_TYPE.WALLET,
          game.bet || 0
        );
        await changeCurrency(
          game.targetUser.id,
          CURRENCY_TYPE.WALLET,
          game.bet || 0
        );
      }
      collector.stop("draw");
      return true;
    }
    if (isWinner(buttons, letter)) {
      game.winner = interaction.user.id;
      const string = `**<@${interaction.user.id}> is the winner!**`;
      const embed = new EmbedBuilder()
        .setTitle("**Tic Tac Toe**")
        .setDescription(`${string}`)
        .setFooter({
          text: `${game.author.tag} vs ${game.targetUser.tag}\n/help tictactoe`,
        });
      if (game.bet && game.winner) {
        await changeCurrency(
          game.winner.id,
          CURRENCY_TYPE.WALLET,
          game.bet * 2
        );
      }
      await message.edit({ embeds: [embed] });
      disableAllButtons(message);
      collector.stop("winner");
      return true;
    } else {
      enableAllButtons(message);
      return false;
    }
  } catch (err) {
    console.log(err);
  }
}
