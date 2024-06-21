const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const PLAYERS_PER_PAGE = 10; // Số lượng người chơi mỗi trang
const { getListTFT } = require("./listtft");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("listtft")
        .setDescription("Xem danh sách người chơi đang chờ")
        .addIntegerOption((option) =>
            option
                .setName("page")
                .setDescription("Trang danh sách người chơi")
                .setRequired(false)
        ),

    async execute(context) {
        const guildId = context.guild.id;
        let page = context.options.getInteger("page") || 1; // Trang mặc định là trang 1

        // Lấy danh sách người chơi cùng guild
        const listguildtft = getListTFT().filter(
            (player) => player.guildId === guildId
        );

        // Kiểm tra số lượng người chơi
        if (listguildtft.length <= PLAYERS_PER_PAGE && page > 1) {
            await context.reply({
                content: "Làm gì có trang khác mà coi! <:chobonk:1123943752147419146>",
                ephemeral: true,
            });
            return;
        }

        // Tính toán vị trí bắt đầu và kết thúc của danh sách người chơi cho trang hiện tại
        const startIndex = (page - 1) * PLAYERS_PER_PAGE;
        const endIndex = page * PLAYERS_PER_PAGE;

        // Lấy danh sách người chơi cho trang hiện tại
        const playersOnPage = listguildtft.slice(startIndex, endIndex);

        // Tạo embed message để hiển thị danh sách người chơi
        const embed = new EmbedBuilder()
            .setTitle(`Danh sách người chơi đang chờ`)
            .setColor("#088BFF")
            .setThumbnail(
                "https://cdn.discordapp.com/attachments/1249448980258226249/1251426699325739008/rules_1.png?ex=666e896f&is=666d37ef&hm=bde2211c0cfa0f33fe552678f615651c888814479363b7e35c111bdc945eec96&"
            )
            .setFooter({
                text: `Trang ${page}`,
                iconURL:
                    "https://cdn.discordapp.com/attachments/1249448980258226249/1251529348431876117/Howling_Abyss_icon.png?ex=666ee908&is=666d9788&hm=27a6aa5ccfb12f2fa40e71f99bfde54b83aa8fc118eec6ba39a9535fe0d76c75&",
            });

        if (playersOnPage.length === 0) {
            embed.setDescription("Hiện không có người chơi nào đang chờ.");
        } else {
            playersOnPage.forEach((player, index) => {
                embed.addFields([
                    {
                        name: `${startIndex + index + 1}. ${player.user}`,
                        value: `> Slot:** ${player.slots}**\n> Chờ trong:** ${player.initialTimeAx}**\n> Chế độ: **${player.type}**\n:loud_sound:[Kết nối](${player.voiceChannelLink})`,
                    },
                ]);
            });

            // Thêm phần hiển thị số trang và nút chuyển trang nếu cần
            if (listguildtft.length > PLAYERS_PER_PAGE) {
                embed.setFooter(
                    `Trang ${page} | ${startIndex + 1}-${endIndex > listguildtft.length ? listguildtft.length : endIndex
                    }/${listguildtft.length}`
                );

                // Nút Trang trước
                if (page > 1) {
                    embed.addField("Trang trước", "<<", true);
                }

                // Nút Trang tiếp theo
                if (endIndex < listguildtft.length) {
                    if (embed.footer) {
                        embed.footer.text += "  •  ";
                    }
                    embed.addField("Trang tiếp theo", ">>", true);
                }
            }
        }

        await context.reply({ embeds: [embed] });
    },
};
