// const { EmbedBuilder } = require('discord.js');
// const { listaram, countdownIntervals } = require('../../commands/tools/aram');

// module.exports = {
//   name: 'voiceStateUpdate',
//   async execute(oldState, newState, client) {
//     // Kiểm tra nếu người dùng rời khỏi voice chat
//     if (!newState.channelId && oldState.channelId) {
//       const userId = oldState.member?.user?.id;

//       if (!userId) {
//         console.error('userId is undefined');
//         return;
//       }

//       const userEntry = listaram.find(entry => entry.userId === userId);

//       if (userEntry) {
//         // Tạo embed mới
//         const embed = new EmbedBuilder()
//           .setDescription(`Rất tiếc, người này đã rời khỏi voicechat.`)
//           .setThumbnail('https://media.discordapp.net/attachments/1249448980258226249/1249689551484489788/5684-kiisu-cry.png?ex=66683797&is=6666e617&hm=8ca6510a020746f7ac46f7e636e34b1fba9d8a27218c7c891c2972e0be32c33e&=&format=webp&quality=lossless&width=105&height=105')
//           .setColor(0x00AE86)
//           .setTimestamp(Date.now());

//         // Ngừng bộ đếm thời gian và xóa nó
//         if (countdownIntervals[userId]) {
//           clearInterval(countdownIntervals[userId]);
//           delete countdownIntervals[userId];
//         }

//         // Sửa tin nhắn gốc
//         try {
//           const channel = await client.channels.fetch(userEntry.channelId);
//           if (channel) {
//             const message = await channel.messages.fetch(userEntry.messageId);
//             if (message) {
//               await message.edit({ embeds: [embed] });
//             } else {
//               console.error(`Message with ID ${userEntry.messageId} not found`);
//             }
//           } else {
//             console.error(`Channel with ID ${userEntry.channelId} not found`);
//           }
//         } catch (error) {
//           console.error('Failed to update message:', error);
//         }

//         // Xóa người dùng khỏi danh sách
//         const userIndex = listaram.indexOf(userEntry);
//         if (userIndex > -1) {
//           listaram.splice(userIndex, 1);
//           console.log('Updated listaram:', listaram);
//         }
//       }
//     }
//   },
// };
