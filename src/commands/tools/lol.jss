const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('lol')
        .setDescription('Tìm người chơi game')
        .addStringOption(option =>
            option.setName('chedo')
                .setDescription('Số lượng slot cần')
                .setRequired(true)
                .addChoices(
                    { name: 'Đấu trường chân lý', value: 'DTCL' },
                    { name: '5 VS 5', value: '5VS5' },
                    { name: '3 VS 3', value: '3VS3' },
                    { name: 'ARAM', value: 'ARAM' }
                ))
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
        const chedo = context.options.getString('chedo');
        let roleId;
        switch (chedo) {
            case 'DTCL': roleId = '';
                break;
            case '5VS5': roleId = '';
                break;
            case '3VS3': roleId = '';
                break;
            case 'ARAM': roleId = '';
                break;
            default:
                break;
        }

        const imageCheDo = {
            '3VS3': 'url link',
            '5VS': 'url link',
            'DTCL': 'url link',
            'ARAM': 'url link'
        };

        const imageURL = imageCheDo[chedo];


    }

}