const { listaram } = require('../../commands/tools/aram');
const { listcusaram } = require('../../commands/tools/cusaram');
const { countdownIntervals } = require('../../commands/tools/aram');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, channelLink } = require('discord.js');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    
    // Ignore reactions from bots
    if (user.bot) return;

    // Get the message the reaction is added to
    const message = reaction.message;

    // Check if the message is in the listaram or listcusaram and within the waiting time
    const player = listaram.find(item => item.messageId === message.id) || listaram.find(item => item.messageId === message.id);

    if (player) {
      if (user.id === player.commandUserId) {
        try {
          await reaction.users.remove(user.id);
        } catch (error) {
          console.error('Failed to send message after reaction:', error);
        }
        return;
      }

      if (!player.reactedUsers) {
        player.reactedUsers = new Set();
      }

      if (player.reactedUsers.has(user.id)) {
        try {
          await reaction.users.remove(user.id);
          await user.send(`Bạn chỉ được reaction một lần.`);
        } catch (error) {
          console.error('Failed to send message after reaction:', error);
        }
        return;
      }

      player.reactedUsers.add(user.id);

      try {
        const voiceChannelId = player.voiceChannelId;
        const textChannel = await reaction.message.guild.channels.fetch(voiceChannelId);
        if (textChannel) {
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('accept')
                .setLabel('Chấp nhận')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId('reject')
                .setLabel('Từ chối')
                .setStyle(ButtonStyle.Secondary)
            );

          const responseMessage = await textChannel.send({
            content: `### <a:oz_thongbao:1251399339407052842>Tìm thấy rồi\nHi, <@${player.commandUserId}>\n <a:oz_arrow1:1251400465292333168> OZI đã kết nối được với người chơi \`${user.username}\`.\n <a:khacloading:1135980575384150117> **XÁC NHẬN?**`,
            components: [row]
          });

          const filter = i => {
            i.deferUpdate();
            return i.user.id === player.commandUserId;
          };

          const collector = responseMessage.createMessageComponentCollector({ filter, max: 1, time: 60000 });

          collector.on('collect', async interaction => {
            if (interaction.customId === 'accept') {

              // Fetch the target user's GuildMember object
              let targetUser = await interaction.guild.members.fetch(user.id);
              console.log(interaction)
              
              // Check if the user is valid and move them to the voice channel
              if (targetUser) {
                await targetUser.voice.setChannel(voiceChannelId);
              }

              await new Promise(resolve => setTimeout(resolve, 1000));
              await textChannel.send(`<a:oz_check:1251400672675631205> Kết nối thành công.\n<@${user.id}>, **hãy bấm vào**<a:oz_arrow5:1251400525459492894> <#${voiceChannelId}> **để tham gia.**`);

              // Grant the user permissions to view and speak in the voice channel if the type is 'hidden'
              if (player.voiceType === 'hidden') {
                const voiceChannel = await reaction.message.guild.channels.fetch(voiceChannelId);
                if (!voiceChannel) {
                  console.error('Failed to fetch voice channel.');
                  return;
                }
                await voiceChannel.permissionOverwrites.edit(user.id, {
                  [PermissionsBitField.Flags.ViewChannel]: true,
                  [PermissionsBitField.Flags.Connect]: true,
                  [PermissionsBitField.Flags.Speak]: true
                });
              }
              await responseMessage.delete();
            } else if (interaction.customId === 'reject') {
              player.reactedUsers.delete(user.id); // Remove user from reacted users set
              // Disable the /aram or /cusaram command for the next 15 minutes
              player.disabledUntil = Date.now() + 15 * 60000;
            }
          });

          collector.on('end', collected => {
            row.components.forEach(button => button.setDisabled(true));
            responseMessage.edit({ components: [row] });
          });
        } else {
          console.error('Text channel not found.');
        }
      } catch (error) {
        console.error('Failed to send message after reaction:', error);
      }
    }
  }
};
