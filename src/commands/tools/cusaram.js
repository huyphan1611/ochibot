const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, Permissions } = require("discord.js");
const { combinedList } = require("./listaram");

let listcusaram = [];
let countdownIntervals = {};
let timeEscapeEnd = null; // Biến toàn cục để lưu trữ thời gian kết thúc của timeEscape
function removePlayerFromList(userId) {
  const index = listcusaram.findIndex((player) => player.userId === userId);
  if (index !== -1) {
    listcusaram.splice(index, 1);
    console.log("Gỡ người dùng khỏi list aram", listcusaram);
  }
}

async function updateEmbed(message, timeEnd, userId) {
  const remainingTime = timeEnd - Date.now();

  let newTimeAx;
  const shouldStop = listcusaram.findIndex(item => item.userId === userId);
  if (!shouldStop) {
    if (remainingTime > 0) {
      // console.log(timeEnd);
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);

      if (remainingTime < 60000) {
        newTimeAx = `\`${seconds} giây\``;
      } else {
        newTimeAx = `\`${minutes} phút\``;
      }

      if (message && message.embeds[0].fields[1].value !== newTimeAx) {
        const updatedEmbed = EmbedBuilder.from(message.embeds[0]).spliceFields(
          1,
          1,
          { name: "Thời gian chờ", value: newTimeAx, inline: true }
        );
        try {
          const shouldStop = !listcusaram.findIndex(item => item.userId === userId);
          if (!shouldStop) {
            await message.edit({ embeds: [updatedEmbed] });
          }
        } catch (error) {
          console.error("Failed to update message:", error);
          clearInterval(countdownIntervals[userId]);
          delete countdownIntervals[userId];
          removePlayerFromList(userId);
        }
      }
    } else {
      clearInterval(countdownIntervals[userId]);
      delete countdownIntervals[userId];
      removePlayerFromList(userId);

      const updatedEmbed = EmbedBuilder.from(message.embeds[0]).spliceFields(
        1,
        1,
        { name: "Thời gian chờ", value: "`Đã vào trận`", inline: true }
      );

      try {
        await message.edit({ embeds: [updatedEmbed] });
      } catch (error) {
        console.error("Failed to update message:", error);
      }
    }
  }
}

async function handleUserLeftVoiceChannel(userId, oldState, newState) {
  clearInterval(countdownIntervals[userId]);
  delete countdownIntervals[userId];

  const userIndex = listcusaram.findIndex((item) => item.userId === userId);
  if (userIndex !== -1) {
    const user = listcusaram[userIndex];
    listcusaram.splice(userIndex, 1);

    const channel = await oldState.guild.channels.fetch(user.channelId);
    const message = await channel.messages.fetch(user.messageId);

    const updatedEmbed = new EmbedBuilder()
      .setDescription(
        `**${oldState.member.user.username}** đã rời khỏi phòng khi đang chờ trận.\n<a:oz_bluewirly:1251414262392291379><a:oz_bluewirly:1251414262392291379><a:oz_bluewirly:1251414262392291379>`
      )
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1249448980258226249/1251506806761586750/oz_ghostblue.png?ex=666ed40a&is=666d828a&hm=5f48380b5f080648c56b444e09d198cdebb5da477e50f0d37ad2a76c7e4cda49&"
      )
      .setColor("#FF5966")
      .setFooter({
        text: "Disconnected",
        iconURL:
          "https://cdn.discordapp.com/attachments/1249448980258226249/1251506086519902218/oz_off.png?ex=666ed35e&is=666d81de&hm=2543a5df7d09fbbf0ca2626871a7ee5047b111ea2bb7837f03bab0be8ca76e6a&",
      })
      .setTimestamp(Date.now());

    try {
      await message.delete();
      await channel.send({ embeds: [updatedEmbed] });
    } catch (error) {
      console.error(
        "Failed to update message after user left the voice channel:",
        error
      );
    }
  }
}

async function handleVoiceStateUpdate(oldState, newState) {
  if (oldState.channelId && oldState.channelId !== newState.channelId) {
    const userInlistcusaram = listcusaram.find((item) => item.userId === oldState.id);

    if (
      userInlistcusaram &&
      userInlistcusaram.voiceChannelLink.includes(oldState.channelId)
    ) {
      await handleUserLeftVoiceChannel(oldState.id, oldState, newState);
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cusaram")
    .setDescription("Tham gia voice chat")
    .addIntegerOption((option) =>
      option
        .setName("slots")
        .setDescription("Số lượng slot cần")
        .setRequired(true)
        .addChoices(
          { name: "1", value: 1 },
          { name: "2", value: 2 },
          { name: "3", value: 3 },
          { name: "4", value: 4 },
          { name: "5", value: 5 },
          { name: "6", value: 6 },
          { name: "7", value: 7 },
          { name: "8", value: 8 },
          { name: "9", value: 9 }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("thoigiancho")
        .setDescription("Thời gian chờ (phút)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("voice")
        .setDescription("Kênh VoiceChat bạn đang dùng là ẩn, hay công khai.")
        .addChoices(
          { name: "Ẩn", value: "hidden" },
          { name: "Công khai", value: "public" }
        )
    ),

  async execute(context) {
    let VCID = null;
    let member;
    const slots = context.options.getInteger("slots");
    const timewait = context.options.getInteger("thoigiancho");
    const voiceType = context.options.getString("voice") || "public";

    if (timewait > 60) {
      await context.reply({
        content: "Bạn chỉ được nhập tối đa là 60 phút.",
        ephemeral: true,
      });
      return;
    }
    if (context.isCommand) {
      member = context.member;
    } else if (context.message && context.message.content.startsWith("?aram")) {
      member =
        context.member || context.guild.members.cache.get(context.author.id);
    } else {
      return;
    }

    if (!member.voice.channel) {
      await context.reply({
        content: "Vui lòng vào một kênh thoại (Voicechat).",
        ephemeral: true,
      });
      return;
    }

    VCID = member.voice.channelId;
    const voiceChannelLink = `https://discord.com/channels/${context.guild.id}/${VCID}`;
    const roleId = "1249209211175440384";

    const existingUserInVC = combinedList.find(
      (player) =>
        player.voiceChannelLink === voiceChannelLink &&
        player.userId !== member.user.id
    );
    console.log(combinedList)
    if (existingUserInVC) {
      await context.reply({
        content: "Đã có người trong room xài lệnh /cusaram.",
        ephemeral: true,
      });
      return;
    }

    const existingUserIndex = listcusaram.findIndex(
      (player) => player.userId === member.user.id
    );
    if (existingUserIndex !== -1) {
      clearInterval(countdownIntervals[member.user.id]);
      delete countdownIntervals[member.user.id];
      listcusaram.splice(existingUserIndex, 1);
      console.log("Gỡ người dùng khỏi list:", listcusaram);
    }

    const timeEnd = Date.now() + timewait * 60000;
    const initialTimeAx = `\`${Math.floor(timewait)} phút\``;
    let descriptions = [
      "<:oz_curvedlineb:1251414270231449730>\n> <:OziPNG:1251519928893308949>: *Đang kết nối • Game Group • Bíp...Bíp...*\n<:oz_curvedlinea:1251414265819168768>\n\n\n<a:oz_check:1251400672675631205> : *Lệnh `/listcusaram` dùng để xem danh sách.*\n<a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314>",

      "<:oz_curvedlineb:1251414270231449730>\n> <:OziPNG:1251519928893308949>: *Cổng kết nối số...được...kích...hoạt...*\n<:oz_curvedlinea:1251414265819168768>\n\n\n<a:oz_check:1251400672675631205> : *Click vào <:oz_cong1:1250524901287264407> phía dưới để * ***gửi yêu cầu tham gia.***\n<a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314>",

      "<:oz_curvedlineb:1251414270231449730>\n> <:OziPNG:1251519928893308949>: *O...ro....zi...iii...* (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)*\n<:oz_curvedlinea:1251414265819168768>\n\n\n<a:oz_check:1251400672675631205> : *Click vào <:oz_cong1:1250524901287264407> phía dưới để * ***gửi yêu cầu tham gia.***\n<a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314>",

      "<:oz_curvedlineb:1251414270231449730>\n> <:OziPNG:1251519928893308949>: *Xin hãy kiên nhẫn • Đang có chút trục trặc...O..zi...(⁠´⁠-⁠﹏⁠-⁠`⁠；⁠)*\n<:oz_curvedlinea:1251414265819168768>\n\n\n<a:oz_check:1251400672675631205> : *Click vào <:oz_cong1:1250524901287264407> phía dưới để * ***gửi yêu cầu tham gia.***\n<a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314>",

      "<:oz_curvedlineb:1251414270231449730>\n> <:OziPNG:1251519928893308949>: *Ngồi xuống nhâm nhi 1 tách trà đi*\n > *Tôi sẽ tìm được cho bạn ngay thôi*\n<:oz_curvedlinea:1251414265819168768>\n\n\n<a:oz_check:1251400672675631205> : *Lệnh `/listcusaram` dùng để xem danh sách.*\n<a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314>",

      "<:oz_curvedlineb:1251414270231449730>\n> <:OziPNG:1251519928893308949>: *Hệ thống Game Group •\n> Xin chào bạn! ♪*\n<:oz_curvedlinea:1251414265819168768>\n\n\n<a:oz_check:1251400672675631205> : *Click vào <:oz_cong1:1250524901287264407> phía dưới để * ***gửi yêu cầu tham gia.***\n<a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314>",

      "<:oz_curvedlineb:1251414270231449730>\n> <:OziPNG:1251519928893308949>: *Ting•ting•ting•♪♪♪* (⁠ꏿ⁠﹏⁠ꏿ⁠;⁠)\n<:oz_curvedlinea:1251414265819168768>\n\n\n<a:oz_check:1251400672675631205> : *Lệnh `/listcusaram` dùng để xem danh sách.*\n<a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314>",

      "<:oz_curvedlineb:1251414270231449730>\n> <:OziPNG:1251519928893308949>: *Vui lòng chờ!\n> Có kẻ đang xâm nhập tường lửa •*\n> (⁠╬⁠☉⁠д⁠⊙⁠)⁠⊰⁠⊹ฺ\n<:oz_curvedlinea:1251414265819168768>\n\n\n<a:oz_check:1251400672675631205> : *Click vào <:oz_cong1:1250524901287264407> phía dưới để * ***gửi yêu cầu tham gia.***\n<a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314><a:oz_rocket:1251414424422580314>",
    ];

    // Hàm để lấy một phần tử ngẫu nhiên từ mảng
    function getRandomDescription(descriptions) {
      const randomIndex = Math.floor(Math.random() * descriptions.length);
      return descriptions[randomIndex];
    }

    const randomDescription = getRandomDescription(descriptions);

    let embed;
    if (voiceType === "public") {
      embed = new EmbedBuilder()
        .setTitle("<:oz_play:1251569356412813394> 𝗖𝗨𝗦𝗧𝗢𝗠 𝗔𝗥𝗔𝗠 ")
        .setDescription(randomDescription)

        .setThumbnail(
          "https://media.discordapp.net/attachments/1249448980258226249/1249449049824690278/giaunoibuonvaodau.png?ex=6667579b&is=6666061b&hm=e89d8f95eaa0af1468cd53fbb055e5ec7ab1a7b5dd0d3a68749512ba591f0aca&=&format=webp&quality=lossless&width=385&height=385"
        )
        .setColor("#1cf1ef")
        .setAuthor({
          name: `${member.user.username} đang tìm kiếm đồng đội`,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp(Date.now())
        .setFooter({
          text: "Connected",
          iconURL:
            "https://cdn.discordapp.com/attachments/1249448980258226249/1251506086310318131/oz_on.png?ex=666ed35e&is=666d81de&hm=8edb196bc4e73337bf411ca60f18d0793b7a57e554cc21c7ba4875fa3290ddc9&",
        })
        .addFields([
          {
            name: `𝑃𝑢𝑏𝑙𝑖𝑐 𝑉𝑜𝑖𝑐𝑒`,
            value: `${voiceChannelLink}`,
            inline: false,
          },
          {
            name: `Thời gian chờ`,
            value: initialTimeAx,
            inline: true,
          },
          {
            name: `◜Slots ◝`,
            value: `**◟[${slots}/10]◞**`,
            inline: true,
          },
        ]);
    } else {
      embed = new EmbedBuilder()
        .setTitle("<:oz_play:1251569356412813394> 𝗖𝗨𝗦𝗧𝗢𝗠 𝗔𝗥𝗔𝗠 ")
        .setDescription(randomDescription)
        .setThumbnail(
          "https://media.discordapp.net/attachments/1249448980258226249/1249449049824690278/giaunoibuonvaodau.png?ex=6667579b&is=6666061b&hm=e89d8f95eaa0af1468cd53fbb055e5ec7ab1a7b5dd0d3a68749512ba591f0aca&=&format=webp&quality=lossless&width=385&height=385"
        )
        .setColor("#1cf1ef")
        .setAuthor({
          name: member.user.username,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp(Date.now())
        .setFooter({
          text: "Connected",
          iconURL:
            "https://cdn.discordapp.com/attachments/1249448980258226249/1251506086310318131/oz_on.png?ex=666ed35e&is=666d81de&hm=8edb196bc4e73337bf411ca60f18d0793b7a57e554cc21c7ba4875fa3290ddc9&",
        })
        .addFields([
          {
            name: `Thời gian chờ`,
            value: initialTimeAx,
            inline: true,
          },
          {
            name: `◜Slots◝`,
            value: `**◟[${slots}/5]◞**`,
            inline: true,
          },
        ]);
    } // Kiểm tra timeEscapeEnd và cập nhật hành vi của lệnh
    if (timeEscapeEnd && Date.now() < timeEscapeEnd) {
    } else {
      await context.channel.send(`Aram`);
      timeEscapeEnd = Date.now() + 12 * 60 * 60 * 1000;
      // Đặt thời gian kết thúc cho 12 giờ tiếp theo
    }

    let message;
    try {
      if (context.isCommand()) {
        await context.deferReply({ ephemeral: true });
        await context.deleteReply();
        message = await context.channel.send({ embeds: [embed] });
        await message.react("1250524901287264407"); // Gắn emoji tùy chỉnh vào tin nhắn
      } else {
        if (context.message) {
          await context.message.delete();
        }
        message = await context.channel.send({ embeds: [embed] });
        await message.react("1250524901287264407"); // Gắn emoji tùy chỉnh vào tin nhắn
      }
    } catch (error) {
      console.error("Failed to send initial message:", error);
      return;
    }
    const timeDelayCommand = Date.now();
    listcusaram.push({
      userId: member.user.id,
      guildId: context.guild.id,
      user: member.user.tag,
      slots: slots,
      voiceChannelLink: voiceChannelLink,
      timeEnd: timeEnd,
      channelId: context.channel.id,
      messageId: message.id,
      initialTimeAx: initialTimeAx,
      commandUserId: member.user.id,
      voiceChannelId: VCID,
      reactedUsers: new Set(),
      disabledUntil: null,
      voiceType: voiceType,
      type: "CUSTOM ARAM",
      timeZ: timeDelayCommand,
    });

    if (countdownIntervals[member.user.id]) {
      clearInterval(countdownIntervals[member.user.id]);
    }

    countdownIntervals[member.user.id] = setInterval(() => {
      updateEmbed(message, timeEnd, member.user.id);
    }, 1000);
  },
  handleVoiceStateUpdate,
  listcusaram,
};

module.exports.listcusaram = listcusaram;
module.exports.countdownIntervals = countdownIntervals;
