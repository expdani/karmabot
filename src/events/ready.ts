const { readdirSync } = require("fs");

/*
  This is an event that gets triggered on ready.
 */
module.exports = {
  once: true,
  execute: (client) => {
    const { commands, application } = client;

    const commandCategories = readdirSync("./src/commands");

    for (const category of commandCategories) {
      const commandFiles = readdirSync(`./src/commands/${category}`).filter(
        (file: any) => file.endsWith(".ts") || file.endsWith(".js")
      );

      for (const file of commandFiles) {
        const commandInteraction = require(`../commands/${category}/${file}`);
        commands.set(commandInteraction.data.name, commandInteraction);
      }
    }

    const commandData = commands.map((i) => i.data);

    console.log(`Logged in as ${client.user.tag}!`);
    return application.commands?.set(commandData);
  },
};
