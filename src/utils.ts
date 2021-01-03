import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import cp from 'child_process';
import util from 'util';

if (!process.env.BOT_TOKEN) {
  console.error(
    'Missing bot token. Please, set the BOT_TOKEN environment variable.',
  );
  process.exit(1);
}

export const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

export const downloadFile = async (fileId: string) => {
  const fileLink = await bot.getFileLink(fileId);
  const fileReq = await fetch(fileLink);
  const fileBuffer = await fileReq.buffer();

  return fileBuffer;
};

export const run = util.promisify(cp.exec);
