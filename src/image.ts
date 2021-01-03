import TelegramBot from 'node-telegram-bot-api';
import sharp from 'sharp';

import { downloadFile } from './utils';

export const imageToSticker = async (
  bot: TelegramBot,
  chatId: number,
  fileId: string,
) => {
  await bot.sendChatAction(chatId, 'typing');

  try {
    const fileBuffer = await downloadFile(fileId);

    const transformedFileBuffer = await sharp(fileBuffer)
      .resize({
        width: 512,
        height: 512,
        fit: 'contain',
        background: {
          r: 0,
          g: 0,
          b: 0,
          alpha: 0,
        },
      })
      .webp()
      .toBuffer();

    await bot.sendSticker(chatId, transformedFileBuffer);
  } catch (error) {
    console.error(error);
    await bot.sendChatAction(chatId, 'typing');
    await bot.sendMessage(chatId, 'Unsupported image format.');
  }
};

export const stickerToImage = async (
  bot: TelegramBot,
  chatId: number,
  fileId: string,
) => {
  try {
    await bot.sendChatAction(chatId, 'upload_document');
    const fileBuffer = await downloadFile(fileId);

    const transformedFileBuffer = await sharp(fileBuffer).png().toBuffer();

    await bot.sendDocument(
      chatId,
      transformedFileBuffer,
      {},
      {
        filename: `${fileId}.png`,
        contentType: 'image/png',
      },
    );
  } catch (error) {
    console.error(error);
    await bot.sendChatAction(chatId, 'typing');
    await bot.sendMessage(chatId, 'Unsupported image format.');
  }
};
