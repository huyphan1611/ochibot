const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Return an embed!'),

  async execute (interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle(`Embed Title`)
      .setDescription(`Embed description`)
      .setColor(0x18e1ee)
      .setImage(
        `https://cdn.discordapp.com/attachments/1239836342456942645/1248235641213550603/banner_2024.gif?ex=6662ed87&is=66619c07&hm=9969cf5a5731df8bd4abc0b4f9cacb87dceef4caa666819b4ab62db1b643ceca&`
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp(Date.now())
      .addFields([
        {
          name: `Dit me Loc`,
          value: `Dit con mee LOOCCCC`,
          inline: true
        },
        {
          name: `Dit me Rain`,
          value: `Dit con mee RainNNNNN`,
          inline: true
        }
      ])

    await interaction.reply({
      embeds: [embed]
    })
  }
}
