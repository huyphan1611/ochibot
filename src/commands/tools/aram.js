
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

let listaram = []; // Danh sách người chơi chờ
let countdownIntervals = {}; // Đối tượng chứa các bộ đếm thời gian cho từng người dùng

function removePlayerFromList(userId) {
  const index = listaram.findIndex(player => player.userId === userId);
  if (index !== -1) {
    listaram.splice(index, 1);
    console.log('Gỡ người dùng khỏi list aram', listaram);
  }
}

// Tạo hàm để cập nhật tin nhắn với thời gian đếm ngược mới
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

    // Chỉ cập nhật nếu thời gian mới khác với thời gian cũ
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
    removePlayerFromList(userId); // Gọi hàm xóa người dùng
    console.log('del mem sau khi hết thời gian:', listaram);

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

  // Tìm người dùng trong danh sách và cập nhật tin nhắn của họ
  const userIndex = listaram.findIndex(item => item.userId === userId);
  if (userIndex !== -1) {
    const user = listaram[userIndex];
    listaram.splice(userIndex, 1);

    // Lấy tin nhắn của người dùng
    const channel = await oldState.guild.channels.fetch(user.channelId);
    const message = await channel.messages.fetch(user.messageId);

    // Cập nhật tin nhắn
    const updatedEmbed = new EmbedBuilder()
      .setDescription(`Rất tiếc, [**${user.user}**] đã rời khỏi phòng`)
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
  // Kiểm tra nếu người dùng chuyển hoặc rời kênh thoại
  if (oldState.channelId && oldState.channelId !== newState.channelId) {
    // Tìm người dùng trong danh sách `listaram`
    const userInListaram = listaram.find(item => item.userId === oldState.id);

    // Kiểm tra nếu người dùng trong `listaram` và kênh thoại cũ của họ là kênh thoại mà họ đã rời hoặc chuyển từ
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
        .setRequired(true)),

  async execute(context) {
    let VCID = null;
    let member;
    const slots = context.options.getInteger('slots');
    const timewait = context.options.getInteger('thoigiancho');
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

    // Kiểm tra nếu có người dùng cùng voice chat sử dụng lệnh /aram
    const existingUserInVC = listaram.find(player => player.voiceChannelLink === voiceChannelLink && player.userId !== member.user.id);
    if (existingUserInVC) {
      await context.reply({ content: 'Đã có người trong room xài lệnh /aram.', ephemeral: true });
      return;
    }

     // Kiểm tra và xóa người dùng cũ trong danh sách
     const existingUserIndex = listaram.findIndex(player => player.userId === member.user.id);
     if (existingUserIndex !== -1) {
       clearInterval(countdownIntervals[member.user.id]);
       delete countdownIntervals[member.user.id];
       listaram.splice(existingUserIndex, 1);
       console.log('Gỡ người dùng khỏi list:', listaram);
     }

    const timeEnd = Date.now() + timewait * 60000;
    const initialTimeAx = `\`${Math.floor(timewait)} phút\``; // Thiết lập giá trị ban đầu của TimeAx

    const embed = new EmbedBuilder()
    .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() }) // Sử dụng tag và avatar của thành viên
    .setDescription(`> Cần tìm vài slot ${voiceChannelLink} \n`)
    .setThumbnail('https://media.discordapp.net/attachments/1249448980258226249/1249449049824690278/giaunoibuonvaodau.png?ex=6667579b&is=6666061b&hm=e89d8f95eaa0af1468cd53fbb055e5ec7ab1a7b5dd0d3a68749512ba591f0aca&=&format=webp&quality=lossless&width=385&height=385')
    .setColor(0x00AE86)
    .setTimestamp(Date.now())
    
    .setFooter({ text: 'Find team', iconURL: 'https://media.discordapp.net/attachments/1249448980258226249/1250722618101989427/favpng_clip-art-vector-graphics-magnifying-glass-illustration.png?ex=666bf9b5&is=666aa835&hm=8cc6e0ccca8beee4e3d02f15b134d64325870a3f768e25a81fcfcee25c9329b9&=&format=webp&quality=lossless&width=563&height=563' })

    .addFields([
      {
        name: `Room Voicechat`,
        value: voiceChannelLink,
        inline: false
      },
      {
        name: `Thời gian chờ`,
        value: initialTimeAx,
        inline: false
      },
      {
        name: `Slots`,
        value: `**${slots}/5**`,
        inline: true
      }
    ]);
  
    let message;
    try {
      if (context.isCommand()) {
        await context.deferReply({ ephemeral: true });
        await context.deleteReply();
        await context.channel.send(`<@${member.user.id}> đang tìm vài anh em chơi! `); //<@&${roleId}>
        message = await context.channel.send({ embeds: [embed] });
      } else {
        if (context.message) {
          await context.message.delete();
        }
        message = await context.channel.send({ embeds: [embed] });
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
      initialTimeAx: initialTimeAx, // Thêm initialTimeAx vào đối tượng
      guildId: context.guild.id // Thêm ID của guild
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

