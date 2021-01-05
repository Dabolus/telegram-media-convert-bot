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

export const botUsername = process.env.BOT_USERNAME || 'TgMediaConvertBot';

export const downloadFile = async (fileId: string) => {
  const fileLink = await bot.getFileLink(fileId);
  const fileReq = await fetch(fileLink);
  const fileBuffer = await fileReq.buffer();

  return fileBuffer;
};

export const run = util.promisify(cp.exec);

export const emojiToCodePoint = (emoji: string): number[] => {
  if (emoji.length === 1) {
    return [emoji.charCodeAt(0)];
  } else if (emoji.length > 1) {
    const pairs = [];
    for (var i = 0; i < emoji.length; i++) {
      if (
        // high surrogate
        emoji.charCodeAt(i) >= 0xd800 &&
        emoji.charCodeAt(i) <= 0xdbff
      ) {
        if (
          emoji.charCodeAt(i + 1) >= 0xdc00 &&
          emoji.charCodeAt(i + 1) <= 0xdfff
        ) {
          // low surrogate
          pairs.push(
            (emoji.charCodeAt(i) - 0xd800) * 0x400 +
              (emoji.charCodeAt(i + 1) - 0xdc00) +
              0x10000,
          );
        }
      } else if (emoji.charCodeAt(i) < 0xd800 || emoji.charCodeAt(i) > 0xdfff) {
        // modifiers and joiners
        pairs.push(emoji.charCodeAt(i));
      }
    }
    return pairs;
  }

  return [];
};

export const chunk = <T = any>(array: T[], element: T): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i++) {
    const subarray: T[] = [];
    while (i < array.length && array[i] !== element) {
      subarray.push(array[i]);
      i++;
    }
    result.push(subarray);
  }
  return result;
};
