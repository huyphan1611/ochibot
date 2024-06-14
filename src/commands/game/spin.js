const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

const B_ITEMS = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'];
const A_ITEMS = ['A1', 'A2', 'A3', 'A4', 'A5'];
const S_ITEMS = ['S1', 'S2', 'S3'];

let userData = {};

function loadUserData() {
    if (fs.existsSync('userdata.json')) {
        userData = JSON.parse(fs.readFileSync('userdata.json'));
    }
}

function saveUserData() {
    fs.writeFileSync('userdata.json', JSON.stringify(userData, null, 2));
}

loadUserData();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spin')
        .setDescription('Quay item bằng Ozo')
        .addIntegerOption(option =>
            option.setName('tickets')
                .setDescription('Số lượng phiếu quay (chỉ được quay 1 hoặc 10 lần)')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const tickets = interaction.options.getInteger('tickets');

        if (tickets !== 1 && tickets !== 10) {
            await interaction.reply('Bạn chỉ được quay 1 hoặc 10 lần mỗi lệnh!');
            return;
        }

        if (!userData[userId]) {
            userData[userId] = { ozi: 0, items: [] };
        }

        let itemsWon = [];

        if (tickets === 10) {
            const randomAItem = A_ITEMS[Math.floor(Math.random() * A_ITEMS.length)];
            itemsWon.push(randomAItem);
            for (let i = 0; i < 9; i++) {
                const randomBItem = B_ITEMS[Math.floor(Math.random() * B_ITEMS.length)];
                itemsWon.push(randomBItem);
            }
        } else {
            const randomBItem = B_ITEMS[Math.floor(Math.random() * B_ITEMS.length)];
            itemsWon.push(randomBItem);
        }

        userData[userId].items.push(...itemsWon);
        saveUserData();

        await interaction.reply(`Bạn đã sử dụng ${tickets} phiếu và nhận được: ${itemsWon.join(', ')}`);
    },
};
