import { MessageReaction, User } from "discord.js";
import { updateUserKarma } from "../controllers/karma/reactions";

module.exports = {
  once: false,
  execute: (client: any, reaction: MessageReaction, user: User) => {
    updateUserKarma(reaction, user, "remove");
  },
};
