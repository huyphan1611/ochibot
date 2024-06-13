const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        // Tạo một embed chào mừng
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Chào mừng thành viên mới!')
            .setDescription(`Chào mừng ${member.user.tag} đến với server!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setImage('https://cdn.discordapp.com/attachments/1249448980258226249/1250443012614520873/Sequence_06.gif?ex=666af54e&is=6669a3ce&hm=a79c24665e398731731f92447d41f496d856246a9b5d81c55ea2fc7f0ea26d3b&')
            .setTimestamp();

        // Gửi embed đến kênh chào mừng
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome');
        if (welcomeChannel) {
            welcomeChannel.send({ embeds: [welcomeEmbed] });
        }
          // Gửi tin nhắn chào mừng tới người dùng
          member.user.send("chào mừng bạn đã đến với gem rúp")
          .then(() => console.log(`Sent welcome message to ${member.user.tag}`))
          .catch(error => {
              console.error(`Could not send welcome message to ${member.user.tag}. Error:`, error);
          });
    },
};
