// const { SlashCommandBuilder } = require('discord.js')

// module.exports = {
//   data: new SlashCommandBuilder().setName('ping').setDescription('Ping me!'),

//   async execute (interaction, client) {
//     const message = await interaction.deferReply({
//       fetchReply: true
//     })

//     // const newMessage = `API Latency: ${client.ws.ping}\nClient Ping: ${
//     //   message.createdTimestamp - interaction.createdTimestamp
//     // }`
//     const randomMessages = [
//       'Hế lô mấy cưng',
//       'Ping cái giề',
//       'Bộ mắc ping lắm hả',
//       'Ở hiền gặp phiền',
//       'Ghiền'
//     ]

//     const randomMessage =
//       randomMessages[Math.floor(Math.random() * randomMessages.length)]

//     await interaction.editReply({
//       content: randomMessage
//     })
//   }
// }




// const { SlashCommandBuilder } = require('@discordjs/builders');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('ping')
//     .setDescription('Replies with Pong!'),
//   async execute(context) {
//     if (context.isCommand && context.isCommand()) {
//       await context.deferReply();
//       await context.editReply('Pong!');
//     } else if (context.reply) {
//       context.reply('Pong!');
//     }
//   },
// };


const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Optional message to include with Pong')
        .setRequired(false)
    ),
  async execute(context) {
    const message = context.options?.getString('message') || '';

    if (context.isCommand) {
      await context.deferReply();
      await context.editReply(`Pong! ${message}`);
    } else if (context.reply) {
      context.reply(`Pong! ${message}`);
    }
  },
};
