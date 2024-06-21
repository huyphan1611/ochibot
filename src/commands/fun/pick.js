const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pick')
        .setDescription('Bot sẽ giúp bạn chọn!')
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Nhập các lựa chọn, phân cách bởi dấu phẩy')
                .setRequired(true)),
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const options = interaction.options.getString('options');
        if (!options) {
            return interaction.reply('Sai cú pháp, vui lòng nhập lệnh `help pick` để biết thêm chi tiết.');
        }
        const pickWordlist = options.split(',').map(option => option.trim());
        const choice = pickWordlist[Math.floor(Math.random() * pickWordlist.length)];
        await interaction.reply(choice);
    },
};
