const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Permissions } = require('discord.js');

let listaram = [];
let countdownIntervals = {};

function removePlayerFromList(userId) {
  const index = listaram.findIndex(player => player.userId === userId);
  if (index !== -1) {
    listaram.splice(index, 1);
    console.log('Gỡ người dùng khỏi list aram', listaram);
  }
}

async function updateEmbed(message, timeEnd, userId) {
  const remainingTime = timeEnd - Date.now();

  let newTimeAx;
  if (remainingTime > 0) {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);

    if (remainingTime < 60000) {
      newTimeAx = `\`${seconds} giây\``;
    } else {
      newTimeAx = `\`${minutes} phút\``;
    }

    if (message.embeds[0].fields[1].value !== newTimeAx) {
      const updatedEmbed = EmbedBuilder.from(message.embeds[0])
        .spliceFields(1, 1, { name: 'Thời gian chờ', value: newTimeAx, inline: true });

      try {
        await message.edit({ embeds: [updatedEmbed] });
      } catch (error) {
        console.error('Failed to update message:', error);
        clearInterval(countdownIntervals[userId]);
        delete countdownIntervals[userId];
        removePlayerFromList(userId);
      }
    }
  } else {
    clearInterval(countdownIntervals[userId]);
    delete countdownIntervals[userId];
    removePlayerFromList(userId);
    console.log('sau khi hết thời gian:', listaram);

    const updatedEmbed = EmbedBuilder.from(message.embeds[0])
      .spliceFields(1, 1, { name: 'Thời gian chờ', value: '`Đã vào trận`', inline: true });

    try {
      await message.edit({ embeds: [updatedEmbed] });
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  }
}

async function handleUserLeftVoiceChannel(userId, oldState, newState) {
  clearInterval(countdownIntervals[userId]);
  delete countdownIntervals[userId];

  const userIndex = listaram.findIndex(item => item.userId === userId);
  if (userIndex !== -1) {
    const user = listaram[userIndex];
    listaram.splice(userIndex, 1);

    const channel = await oldState.guild.channels.fetch(user.channelId);
    const message = await channel.messages.fetch(user.messageId);

    const updatedEmbed = new EmbedBuilder()
      .setDescription(`Rất tiếc, tôi đã rời khỏi phòng`)
      .setThumbnail('https://cdn.discordapp.com/attachments/1249448980258226249/1249689551484489788/5684-kiisu-cry.png?ex=66683797&is=6666e617&hm=8ca6510a020746f7ac46f7e636e34b1fba9d8a27218c7c891c2972e0be32c33e&')
      .setColor(0x00AE86)
      .setTimestamp(Date.now());

    try {
      await message.edit({ embeds: [updatedEmbed] });
    } catch (error) {
      console.error('Failed to update message after user left the voice channel:', error);
    }
  }
}

async function handleVoiceStateUpdate(oldState, newState) {
  if (oldState.channelId && oldState.channelId !== newState.channelId) {
    const userInListaram = listaram.find(item => item.userId === oldState.id);

    if (userInListaram && userInListaram.voiceChannelLink.includes(oldState.channelId)) {
      await handleUserLeftVoiceChannel(oldState.id, oldState, newState);
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aram')
    .setDescription('Tham gia voice chat')
    .addIntegerOption(option => 
      option.setName('slots')
        .setDescription('Số lượng slot cần')
        .setRequired(true)
        .addChoices(
          { name: '1', value: 1 },
          { name: '2', value: 2 },
          { name: '3', value: 3 },
          { name: '4', value: 4 }
        ))
    .addIntegerOption(option => 
      option.setName('thoigiancho')
        .setDescription('Thời gian chờ (phút)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('voice')
        .setDescription('Kênh VoiceChat bạn đang dùng là ẩn, hay công khai.')
        .addChoices(
          { name: 'Ẩn', value: 'hidden' },
          { name: 'Công khai', value: 'public' }
        )),

  async execute(context) {
    let VCID = null;
    let member;
    const slots = context.options.getInteger('slots');
    const timewait = context.options.getInteger('thoigiancho');
    const voiceType = context.options.getString('voice') || 'public';

    if (timewait > 60) {
      await context.reply({ content: 'Bạn chỉ được nhập tối đa là 60 phút.', ephemeral: true });
      return;
    }
    if (context.isCommand) {
      member = context.member;
    } else if (context.message && context.message.content.startsWith('?aram')) {
      member = context.member || context.guild.members.cache.get(context.author.id);
    } else {
      return;
    }

    if (!member.voice.channel) {
      await context.reply({ content: 'Vui lòng vào một kênh thoại (Voicechat).', ephemeral: true });
      return;
    }

    VCID = member.voice.channelId;
    const voiceChannelLink = `https://discord.com/channels/${context.guild.id}/${VCID}`;
    const roleId = '1249209211175440384';

    const existingUserInVC = listaram.find(player => player.voiceChannelLink === voiceChannelLink && player.userId !== member.user.id);
    if (existingUserInVC) {
      await context.reply({ content: 'Đã có người trong room xài lệnh /aram.', ephemeral: true });
      return;
    }

    const existingUserIndex = listaram.findIndex(player => player.userId === member.user.id);
    if (existingUserIndex !== -1) {
      clearInterval(countdownIntervals[member.user.id]);
      delete countdownIntervals[member.user.id];
      listaram.splice(existingUserIndex, 1);
      console.log('Gỡ người dùng khỏi list:', listaram);
    }

    const disabledUser = listaram.find(player => player.commandUserId === member.user.id && player.disabledUntil && player.disabledUntil > Date.now());
    if (disabledUser) {
      await context.reply({ content: 'Lệnh /aram hiện không sử dụng được, vui lòng thử lại sau.', ephemeral: true });
      return;
    }

    const timeEnd = Date.now() + timewait * 60000;
    const initialTimeAx = `\`${Math.floor(timewait)} phút\``;
    const descriptions = [
      'Mô tả ngẫu nhiên số 1',
      'Mô tả ngẫu nhiên số 2',
      'Mô tả ngẫu nhiên số 3',
      'Mô tả ngẫu nhiên số 4',
      'Mô tả ngẫu nhiên số 5'
    ];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

    let embed;
    if (voiceType === 'public') {
      embed = new EmbedBuilder()
        .setDescription(`Cần tìm vài slot `)
        .setThumbnail('https://media.discordapp.net/attachments/1249448980258226249/1249449049824690278/giaunoibuonvaodau.png?ex=6667579b&is=6666061b&hm=e89d8f95eaa0af1468cd53fbb055e5ec7ab1a7b5dd0d3a68749512ba591f0aca&=&format=webp&quality=lossless&width=385&height=385')
        .setColor(0x00AE86)
        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp(Date.now())
        .setFooter({ text: 'Chọn +1 phía dưới để gửi đề nghị tham gia. ', iconURL: 'https://cdn.discordapp.com/attachments/1249448980258226249/1251126006245359696/down2.png?ex=666d7164&is=666c1fe4&hm=3193f247e42ac81ecb7eab2513031ebd297c9be863659eed1336e22bea05f0c5&' })
        .addFields([
          {
            name: `RoomVoice`,
            value: `${voiceChannelLink}`,
            inline: false
          },
          {
            name: `Thời gian chờ`,
            value: initialTimeAx,
            inline: true
          },
          {
            name: `◜Slots◝`,
            value: `◟[${slots}/5]◞`,
            inline: true
          }
        ]);
    } else {
      embed = new EmbedBuilder()
        .setDescription(`Cần tìm vài slot `)
        .setThumbnail('https://media.discordapp.net/attachments/1249448980258226249/1249449049824690278/giaunoibuonvaodau.png?ex=6667579b&is=6666061b&hm=e89d8f95eaa0af1468cd53fbb055e5ec7ab1a7b5dd0d3a68749512ba591f0aca&=&format=webp&quality=lossless&width=385&height=385')
        .setColor(0x00AE86)
        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp(Date.now())
        .setFooter({ text: 'Chọn +1 phía dưới để gửi đề nghị tham gia. ', iconURL: 'https://cdn.discordapp.com/attachments/1249448980258226249/1251126006245359696/down2.png?ex=666d7164&is=666c1fe4&hm=3193f247e42ac81ecb7eab2513031ebd297c9be863659eed1336e22bea05f0c5&' })
        .addFields([
          {
            name: `Thời gian chờ`,
            value: initialTimeAx,
            inline: true
          },
          {
            name: `◜Slots◝`,
            value: `◟[${slots}/5]◞`,
            inline: true
          }
        ]);
    }

    let message;
    try {
      if (context.isCommand()) {
        await context.deferReply({ ephemeral: true });
        await context.deleteReply();
        await context.channel.send(`<@${member.user.id}> đang tìm vài anh em chơi!`);
        message = await context.channel.send({ embeds: [embed] });
        await message.react('1250524901287264407'); // Gắn emoji tùy chỉnh vào tin nhắn
      } else {
        if (context.message) {
          await context.message.delete();
        }
        message = await context.channel.send({ embeds: [embed] });
        await message.react('1250524901287264407'); // Gắn emoji tùy chỉnh vào tin nhắn
      }
    } catch (error) {
      console.error('Failed to send initial message:', error);
      return;
    }

    listaram.push({
      userId: member.user.id,
      guildId: context.guild.id,
      user: member.user.tag,
      slots: slots,
      voiceChannelLink: voiceChannelLink,
      timeEnd: timeEnd,
      channelId: context.channel.id,
      messageId: message.id,
      initialTimeAx: initialTimeAx,
      commandUserId: member.user.id,
      voiceChannelId: VCID,
      reactedUsers: new Set(),
      disabledUntil: null,
      voiceType: voiceType
    });

    if (countdownIntervals[member.user.id]) {
      clearInterval(countdownIntervals[member.user.id]);
    }

    countdownIntervals[member.user.id] = setInterval(() => {
      updateEmbed(message, timeEnd, member.user.id);
    }, 1000);
  },
  handleVoiceStateUpdate
};

module.exports.listaram = listaram;
module.exports.countdownIntervals = countdownIntervals;
