import { SlashCommandBuilder } from "discord.js";
import sendRequest from "../../controllers/minigames/tictactoe/request";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Play tic tac toe with someone!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Someone you want to play tic tac toe with.")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("bet")
        .setDescription("Place a bet to play for.")
        .setRequired(false)
    ),
  execute: (interaction) => {
    const targetUser = interaction.options.getUser("user");
    const bet = interaction.options.getNumber("bet");
    const author = interaction.user;

    sendRequest(interaction, author, targetUser, bet);
  },
};
