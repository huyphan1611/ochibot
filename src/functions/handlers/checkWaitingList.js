const { EmbedBuilder } = require("discord.js");
let { listaram } = require("../../commands/tools/aram"); // Chuyển từ const sang let

module.exports = (client) => {
  const checkWaitingList = () => {
    const now = Date.now();
    listaram = listaram.filter((player) => {
      const guild = client.guilds.cache.get(player.guildId);
      if (!guild) return false;

      const member = guild.members.cache.get(player.userId);
      if (!member || !member.voice.channel) {
        return false;
      }

      if (member.voice.channel.members.size >= 5 || player.timeEnd <= now) {
        return false;
      }

      return true;
    });

    setTimeout(checkWaitingList, 60000); // Schedule next check in 60 seconds
  };

  // Start the first check
  checkWaitingList();
};

// const { EmbedBuilder } = require('discord.js');
// let { listaram } = require('../../commands/tools/aram'); // Chuyển từ const sang let

// module.exports = (client) => {
//   const checkWaitingList = () => {
//     const now = Date.now();
//     listaram = listaram.filter(player => {
//       const guild = client.guilds.cache.get(player.guildId);
//       if (!guild) return false;

//       const member = guild.members.cache.get(player.userId);
//       if (!member || !member.voice.channel) {
//         return false;
//       }

//       if (member.voice.channel.members.size >= 5 || player.timeEnd <= now) {
//         // Remove player from the list
//         return false;
//       }

//       return true;
//     });

//     setTimeout(checkWaitingList, 60000); // Schedule next check in 60 seconds
//   };

//   // Start the first check
//   checkWaitingList();
// };
