const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync(`./src/commands`);

    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);

        // Kiểm tra và ghi log nếu command không có data hoặc name
        if (!command.data) {
          console.error(`Command in file ${file} is missing 'data' or 'name'.`);
          continue; // Bỏ qua tệp lệnh không hợp lệ
        } else {
          commands.set(command.data.name, command);
          if (command.data.toJSON) {
            commandArray.push(command.data.toJSON());
          }
        }
      }
    }

    const clientId = process.env.clientId;
    const guildId = process.env.guildId;
    const rest = new REST({ version: "10" }).setToken(process.env.token);

    try {
      console.log("Bắt đầu khởi tạo slash commands");

      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: client.commandArray,
      });

      console.log("Khởi tạo slash thành công");
    } catch (error) {
      console.error(error);
    }
  };
};

// client.on('guildCreate', guild => {
//   console.log(`Bot đã tham gia server mới: ${guild.name} (ID: ${guild.id})`);

//   // Lấy giá trị hiện tại của GUILD_IDS
//   let currentGuildIds = process.env.GUILD_IDS ? process.env.GUILD_IDS.split(',') : [];

//   // Thêm guildId mới vào danh sách
//   currentGuildIds.push(guild.id);

//   // Cập nhật giá trị GUILD_IDS trong .env
//   const newGuildIds = currentGuildIds.join(',');
//   fs.writeFileSync('.env', `GUILD_IDS=${newGuildIds}\n`, 'utf8');

//   // Cập nhật biến môi trường trong quá trình chạy
//   process.env.guildId = newGuildIds;
// });
