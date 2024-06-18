const { InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isCommand()) {
      if (interaction.type === InteractionType.ApplicationCommand) {
        if (interaction.user.bot) return;
      }

      try {
        const command = client.commands.get(interaction.commandName);
        console.log(interaction);
        console.log(client.commands)
        if (!command) return;
        await command.execute(interaction, client);
      } catch (error) {
        console.log(error);
        return interaction.reply({ content: 'Đã xảy ra lỗi, xin vui lòng thử lại sau', ephemeral: true });
      }
    }
    // if (interaction.isChatInputCommand()) {
    //   const { commands } = client;
    //   const { commandName } = interaction;
    //   const command = commands.get(commandName);

    //   if (!command) return;

    //   try {
    //     await command.execute(interaction, client);
    //   } catch (error) {
    //     console.error(error);
    //     await interaction.reply({
    //       content: `Có lỗi xảy ra khi thực hiện lệnh!`,
    //       ephemeral: true,
    //     });
    //   }
    // }
  }
};
