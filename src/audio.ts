import os from 'os';
import { promises as fs } from 'fs';

import ffmpegPath from 'ffmpeg-static';
import TelegramBot from 'node-telegram-bot-api';

import { run } from './utils';

export const audioToVoice = async (
  bot: TelegramBot,
  chatId: number,
  fileId: string,
) => {
  try {
    await bot.sendChatAction(chatId, 'record_audio');

    const filePath = await bot.downloadFile(fileId, os.tmpdir());
    const processedFilePath = filePath.replace(/\..+$/, '.ogg');

    await run(
      `${ffmpegPath} -i ${filePath} -c:a libopus -b:a 48K -application voip ${processedFilePath}`,
    );

    await bot.sendVoice(chatId, processedFilePath);

    await Promise.all([fs.unlink(filePath), fs.unlink(processedFilePath)]);
  } catch (error) {
    console.log(error);

    await bot.sendChatAction(chatId, 'typing');
    await bot.sendMessage(chatId, 'Unsupported audio format.');
  }
};

export const voiceToAudio = async (
  bot: TelegramBot,
  chatId: number,
  fileId: string,
) => {
  try {
    await bot.sendChatAction(chatId, 'upload_audio');

    const filePath = await bot.downloadFile(fileId, os.tmpdir());
    const processedFilePath = filePath.replace(/\..+$/, '.m4a');

    await run(
      `${ffmpegPath} -i ${filePath} -c:a aac -b:a 128K ${processedFilePath}`,
    );

    await bot.sendAudio(chatId, processedFilePath);

    await Promise.all([fs.unlink(filePath), fs.unlink(processedFilePath)]);
  } catch (error) {
    console.log(error);

    await bot.sendChatAction(chatId, 'typing');
    await bot.sendMessage(chatId, 'Unsupported voice format.');
  }
};
