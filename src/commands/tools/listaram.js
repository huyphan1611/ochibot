const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const PLAYERS_PER_PAGE = 10; // Số lượng người chơi mỗi trang

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listaram')
    .setDescription('Xem danh sách người chơi đang chờ')
    .addIntegerOption(option =>
      option.setName('page')
        .setDescription('Trang danh sách người chơi')
        .setRequired(false)),

  async execute(context) {
    // Cập nhật biến listaram động
    let { listaram } = require('../../commands/tools/aram');

    console.log(listaram); // Xuất ra console.log của biến listaram

    const guildId = context.guild.id;
    let page = context.options.getInteger('page') || 1; // Trang mặc định là trang 1

    // Lấy danh sách người chơi cùng guild
    const listguildaram = listaram.filter(player => player.guildId === guildId);

    // Kiểm tra số lượng người chơi
    if (listguildaram.length <= PLAYERS_PER_PAGE && page > 1) {
      await context.reply({ content: 'Làm gì có trang khác mà coi! <:chobonk:1123943752147419146>', ephemeral: true });
      return;
    }

    // Tính toán vị trí bắt đầu và kết thúc của danh sách người chơi cho trang hiện tại
    const startIndex = (page - 1) * PLAYERS_PER_PAGE;
    const endIndex = page * PLAYERS_PER_PAGE;

    // Lấy danh sách người chơi cho trang hiện tại
    const playersOnPage = listguildaram.slice(startIndex, endIndex);

    // Tạo embed message để hiển thị danh sách người chơi
    const embed = new EmbedBuilder()
      .setTitle(`Danh sách người chơi đang chờ - Trang ${page}`)
      .setColor(0x00AE86)
      .setTimestamp(Date.now())
      .setThumbnail(
        `https://cdn.discordapp.com/attachments/1249448980258226249/1250155367925547028/Pngtreevector_list_icon_3772778.png?ex=6669e96a&is=666897ea&hm=a35a59cba202015fd9e4d65bb276ad054a44fbb48a5923b5ce9e7070941c72a3&`
      );

    if (playersOnPage.length === 0) {
      embed.setDescription('Hiện không có người chơi nào đang chờ.');
    } else {
      playersOnPage.forEach((player, index) => {
        embed.addFields([
          {
            name: `Người chơi ${startIndex + index + 1}`,
            value: `${player.user}, số slot: ${player.slots}/5, [Voice Channel](${player.voiceChannelLink}), Thời gian chờ: ${player.initialTimeAx}`
          }
        ]);
      });

      // Thêm phần hiển thị số trang và nút chuyển trang nếu cần
      if (listguildaram.length > PLAYERS_PER_PAGE) {
        embed.setFooter(`Trang ${page} | ${startIndex + 1}-${endIndex > listguildaram.length ? listguildaram.length : endIndex}/${listguildaram.length}`);

        // Nút Trang trước
        if (page > 1) {
          embed.addField('Trang trước', '<<', true);
        }

        // Nút Trang tiếp theo
        if (endIndex < listguildaram.length) {
          if (embed.footer) {
            embed.footer.text += '  •  ';
          }
          embed.addField('Trang tiếp theo', '>>', true);
        }
      }
    }

    await context.reply({ embeds: [embed] });
  }
};
