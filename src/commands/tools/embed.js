const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Tạo ra một giao diện embed!'),

    async execute (interaction, client,agrs) {

 
      const embed = new EmbedBuilder()
        .setTitle(`Embed Title`)
        .setDescription(randomDescription)
        .setColor(0x18e1ee)
        .setImage(
          `https://cdn.discordapp.com/attachments/1239836342456942645/1248235641213550603/banner_2024.gif?ex=6662ed87&is=66619c07&hm=9969cf5a5731df8bd4abc0b4f9cacb87dceef4caa666819b4ab62db1b643ceca&`
        )
        .setThumbnail()
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
  
  
  
    








// Hướng dẫn Random Decription
const descriptions = [
  'Mô tả ngẫu nhiên số 1',
  'Mô tả ngẫu nhiên số 2',
  'Mô tả ngẫu nhiên số 3',
  'Mô tả ngẫu nhiên số 4',
  'Mô tả ngẫu nhiên số 5'
];
 // Chọn ngẫu nhiên một câu từ mảng
 const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];


// HƯỚNG DẪN RULES
// async execute(interaction, client, args) {
//   // ID của người dùng được phép sử dụng lệnh này
//   const allowedUserId = '395151484179841024';

//   // Kiểm tra nếu user ID của người sử dụng lệnh không phải là allowedUserId
//   if (interaction.user.id !== allowedUserId) {
//     return interaction.reply({
//       content: 'Bạn không có quyền sử dụng lệnh này!',
//       ephemeral: true
//     });
//   }

//   const embed = new EmbedBuilder()
//     .setAuthor({
//       name: '𝐆𝐀𝐌𝐄 𝐆𝐑𝐎𝐔𝐏',
//       iconURL: 'https://cdn.discordapp.com/attachments/1249448980258226249/1251427622911737887/oz_shinybluemoderator.png?ex=666e8a4b&is=666d38cb&hm=9904894e087f6f5b2349c64652cf85e598689a4d085f7abf385814cb04ed1e76&',
//       url: 'https://discord.gg/gamegroup'
//     })
//     .setTitle('Một số điều luật Game Group nên có')
//     .setDescription('<:oz_1:1251406651244679220> **Không Spam :** \n● Không gửi tin nhắn liên tục hoặc không cần thiết.\n● Tránh sử dụng các bot tự động để spam.\n\n<:oz_2:1251406653153214587> **Không 18+ :**\n● Tuyệt đối không chia sẻ nội dung khiêu dâm, bạo lực hoặc không phù hợp với mọi lứa tuổi, điều này được áp dụng lên cả avatar.\n● Không sử dụng ngôn từ tục tĩu hoặc xúc phạm.\n\n<:oz_3:1251406654575218769> **Không Toxic :**\n● Tôn trọng tất cả thành viên, không nói xấu, gây gổ, chửi bới.\n● Tránh các hành vi khiêu khích hoặc gây hấn.\n\n<:oz_4:1251406645184172045> **Không Drama :**\n● Tránh đem các vấn đề cá nhân vào kênh công cộng.\n● Tự giải quyết mâu thuẫn cá nhân.')
//     .setColor('#628EFA')
//     .setImage('https://cdn.discordapp.com/attachments/1249448980258226249/1251432492330647626/rule.png?ex=666e8ed4&is=666d3d54&hm=576ababe53e8a280dda43336b3bdaf39472ae4dda67e45b0be2574a24a96d8ed&')
//     .setThumbnail('https://media.discordapp.net/attachments/1249448980258226249/1251426699325739008/rules_1.png?ex=666e896f&is=666d37ef&hm=bde2211c0cfa0f33fe552678f615651c888814479363b7e35c111bdc945eec96&=&format=webp&quality=lossless')
//     .setTimestamp(Date.now())
//     .setFooter({
//       text: 'Game Group nên chỉ là một Group kết nối anh em chơi game',
//       iconURL: 'https://cdn.discordapp.com/attachments/1249448980258226249/1251427623142297620/oz_shinyblueverified.png?ex=666e8a4b&is=666d38cb&hm=42ff49d8a040f678ae3130003aeba9d71c98bd71b85ac25f2ab62372cbdca0ff&'
//     });
// // Gửi một tin nhắn mới với embed
// const message = await interaction.channel.send({ embeds: [embed] });
//   // Xóa tin nhắn sau 5 giây và gửi lại embed
//   setTimeout(async () => {
//     await message.delete();
//     await interaction.channel.send({ embeds: [embed] });
//   }, 5000);
// }
// };
