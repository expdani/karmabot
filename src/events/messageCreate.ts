import { setupKarmaReactions } from "../controllers/karma/reactions";

module.exports = {
  once: false,
  execute: (client: any, message: any) => {
      setupKarmaReactions(message);
  },
};
