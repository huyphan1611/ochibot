const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Gửi tin nhắn đến một kênh với ID cụ thể')
        .addStringOption(option => 
            option.setName('channelid')
                .setDescription('ID của kênh')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Nội dung tin nhắn')
                .setRequired(true)),
    async execute(interaction) {
        const channelId = interaction.options.getString('channelid');
        const message = interaction.options.getString('message');

        const channel = await interaction.client.channels.fetch(channelId);
        if (!channel) {
            return interaction.reply({ content: 'Không tìm thấy kênh với ID đã cho.', ephemeral: true });
        }

        try {
            await channel.send(message);
            await interaction.reply({ content: 'Tin nhắn đã được gửi!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Có lỗi xảy ra khi gửi tin nhắn.', ephemeral: true });
        }
    },
};
