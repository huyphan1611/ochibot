const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Ping me!'),

  async execute (interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true
    })

    // const newMessage = `API Latency: ${client.ws.ping}\nClient Ping: ${
    //   message.createdTimestamp - interaction.createdTimestamp
    // }`
    const randomMessages = [
      'Hế lô mấy cưng',
      'Ping cái giề',
      'Bộ mắc ping lắm hả',
      'Ở hiền gặp phiền',
      'Ghiền'
    ]

    const randomMessage =
      randomMessages[Math.floor(Math.random() * randomMessages.length)]

    await interaction.editReply({
      content: randomMessage
    })
  }
}
