import TelegramBot from 'node-telegram-bot-api';

if (!process.env.BOT_TOKEN) {
  console.error(
    'Missing bot token. Please, set the BOT_TOKEN environment variable.',
  );
  process.exit(1);
}

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', (msg) => {
  console.log(msg);
});
