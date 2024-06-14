const { ActivityType } = require("discord.js");
const checkWaitingList = require('../../functions/handlers/checkWaitingList'); // Đảm bảo đường dẫn đúng tới checkWaitingListc

module.exports = {
  name: 'ready',
  once: true,
  async execute (client) {
    console.log(`duoc roi ${client.user.tag} online.`)
    // Bắt đầu task kiểm tra danh sách người chơi
    checkWaitingList(client);
    
    client.user.setPresence({
      activities: [{ name: 'đùa với nỗi cô đơn!', type: ActivityType.Playing }],
      status: 'online',
    });
  }
  
}

