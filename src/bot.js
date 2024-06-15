require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize'); //data tiền tệ

const token = process.env.token;
const prefix = process.env.PREFIX;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // Cần thiết để nhận diện sự kiện guildMemberAdd
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions // Intents cần thiết để đọc nội dung tin nhắn
  ]
});

client.commands = new Collection();
client.commandArray = [];


// Thiết lập SQLite thông qua Sequelize
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: 'database.sqlite'
// });

// Mô hình người dùng với hai loại tiền tệ
// const User = sequelize.define('User', {
//   userId: {
//       type: DataTypes.STRING,
//       unique: true,
//   },
//   currency1: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//   },
//   currency2: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//   },
// });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  console.log('Command Name:', commandName);
  console.log('Args:', args);

// tự nhân diện guild
client.on('guildCreate', guild => {
    console.log(`Joined a new guild: ${guild.name} (${guild.id})`);
    updateEnvFile(guild.id);
});

function updateEnvFile(guildId) {
    const envPath = './.env';
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const guildIdPattern = /^GUILD_ID=.*$/m;

    let newEnvContent;
    if (envContent.match(guildIdPattern)) {
        newEnvContent = envContent.replace(guildIdPattern, `GUILD_ID=${guildId}`);
    } else {
        newEnvContent = `${envContent}\nGUILD_ID=${guildId}`;
    }

    fs.writeFileSync(envPath, newEnvContent, 'utf-8');
    console.log('Updated .env file with new guild ID.');
}
// 1111

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    const context = {
        isCommand: true,
        options: {
          getString: (index) => {
            return args[index] || null;
          },
          getInteger: (index) => {
            const value = args[index];
            return value ? parseInt(value, 10) : null;
          },
          // Add more methods if needed, similar to getString and getInteger
      },
      reply: async (msg) => await message.reply(msg),
      deferReply: async () => {},
      editReply: async (msg) => await message.edit(msg),
      // User: User // Thêm User vào context
    };

    await command.execute(context);
  } catch (error) {
    console.error(error);
    message.reply('Không xài được lệnh này đâu ní ơi :(');
  }
});
// Đăng ký sự kiện voiceStateUpdate
const aram = require('./commands/tools/aram');
client.on('voiceStateUpdate', aram.handleVoiceStateUpdate);


const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter(file => file.endsWith('.js'));
  for (const file of functionFiles) {
    require(`./functions/${folder}/${file}`)(client); // Đảm bảo đường dẫn đúng
  }
}
client.handleEvents();
client.handleCommands();
client.login(token);

