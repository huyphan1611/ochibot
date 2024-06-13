const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Message } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a game')
        .addIntegerOption(option =>
            option.setName('slots')
                .setDescription('Số lượng người đang trong phòng')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Nói gì đó cho ngầu đi!')
                .setRequired(false)),

    async execute(interaction) {
        let Noigido, slots;

        if (interaction instanceof CommandInteraction) {
            Noigido = interaction.options.getString('message');
            slots = interaction.options.getInteger('slots');
        } else if (interaction instanceof Message) {
            const args = interaction.content.slice(1).trim().split(/ +/);
            slots = parseInt(args[1], 10);
            Noigido = args.slice(2).join(' ');
        } else {
            await interaction.reply('Lệnh không hợp lệ.');
            return;
        }

        if (Noigido) {
            await interaction.reply(`Hello chúng tôi có ${slots} slot, ${Noigido}`);
        } else {
            await interaction.reply(`Hello chúng tôi có ${slots} slot.`);
        }
    },
};
