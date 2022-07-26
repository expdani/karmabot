import { Emoji, Message, MessageReaction, User } from "discord.js";
import { initiateKarmaPost, removeKarmaPost, updateKarma } from "../../apollo/karma";
import { getServerSettings } from "../../apollo/settings";
import { VOTE_ENUM } from "../../types/karma";

const UPVOTE = ["upvote", "👍"];
const DOWNVOTE = ["downvote", "👎"];

/**
 * Add karma reactions to a message.
 */
export async function setupKarmaReactions(message: any) {
  const settings = await getServerSettings(message.guild.id);
  if (!settings.karma_enabled || !settings.karma_reactions) return;

  const content = message.content.toLowerCase();
  if (
    content.includes("https://") ||
    content.includes("http://") ||
    message.attachments.size > 0
  ) {
    const upvote =
      message.guild.emojis.cache.find((emoji: Emoji) => emoji.name === "upvote") ||
      "👍";
    const downvote =
      message.guild.emojis.cache.find((emoji: Emoji) => emoji.name === "downvote") ||
      "👎";

    await message.react(upvote);
    await message.react(downvote);
  }
}

/**
 * Update karma when reacted.
 */
export async function updateUserKarma(reaction: MessageReaction, user: User, type: string) {
	if (user.bot) return;
	if (reaction.message.author.id === user.id) return;
	const message = reaction.message;
  if (UPVOTE.includes(reaction.emoji.name) || DOWNVOTE.includes(reaction.emoji.name)) {
		const addAmount = UPVOTE.includes(reaction.emoji.name) ? 1 : DOWNVOTE.includes(reaction.emoji.name) ? -1 : 0;
		const removeAmount = UPVOTE.includes(reaction.emoji.name) ? -1 : DOWNVOTE.includes(reaction.emoji.name) ? 1 : 0;

		await updateKarma(
      message.author.id,
      message.guild.id,
      type === "add" ? addAmount : removeAmount
    );
    if (type === "add") {
      await initiateKarmaPost(
        user.id,
        message.guild.id,
        message.id,
        message.author.id,
        UPVOTE.includes(reaction.emoji.name) ? VOTE_ENUM.UPVOTE : VOTE_ENUM.DOWNVOTE
      );
    } else {
      await removeKarmaPost(
        user.id,
        message.guild.id,
        message.id,
        message.author.id
      );
    }
  }
}
