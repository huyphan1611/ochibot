const { listaram } = require('../../commands/tools/aram');
const { countdownIntervals } = require('../../commands/tools/aram');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    // Ignore reactions from bots
    if (user.bot) return;

    // Get the message the reaction is added to
    const message = reaction.message;

    // Check if the message is in the listaram and within the waiting time
    const player = listaram.find(item => item.messageId === message.id);

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
                content: `<@${player.commandUserId}>, Người chơi \`${user.username}\` đang yêu cầu vào voice channel <#${voiceChannelId}>.`,
                components: [row]
              });
    
              const filter = i => {
                i.deferUpdate();
                return i.user.id === player.commandUserId;
              };
    
              const collector = responseMessage.createMessageComponentCollector({ filter, max: 1, time: 60000 });
    
              collector.on('collect', async interaction => {
                if (interaction.customId === 'accept') {
                  await textChannel.send(`<@${user.id}>, Mời bạn vào room <#${voiceChannelId}>.`);
                                                                                                       console.log(voiceChannelId);  console.log('cac'); console.log(player); console.log(player.voiceType);
                  // Grant the user permissions to view and speak in the voice channel if the type is 'hidden'
                  if (player.voiceType === 'hidden') {
                    const voiceChannel = await reaction.message.guild.channels.fetch(voiceChannelId);
                                                                                                          console.log(voiceChannel);console.log('con cac')
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
                } else if (interaction.customId === 'reject') {
                  await user.send(`> <@${user.id}> có vẻ đã trượt mất cơ hội rồi\n> Nhưng không sao, cơ hội sẽ đến nếu ngươi tiếp tục.\n> Ta tin ngươi sẽ tìm được đồng đội!<:chohug:1123943848360554496>`);
                  player.reactedUsers.delete(user.id); // Remove user from reacted users set
                  // Disable the /aram command for the next 15 minutes
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

