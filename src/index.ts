import type { PhotoSize } from 'node-telegram-bot-api';

import { bot } from './utils';
import { imageToSticker, stickerToImage } from './image';

bot.on('photo', async ({ chat: { id }, photo = [] }) => {
  const { file_id: largestFileId } = photo.reduce<PhotoSize>(
    (largestFile, file = { file_id: '', width: 0, height: 0 }) =>
      file.width > largestFile.width ? file : largestFile,
    { file_id: '', width: 0, height: 0 },
  );

  if (!largestFileId) {
    return;
  }

  await imageToSticker(bot, id, largestFileId);
});

bot.on('sticker', async ({ chat: { id }, sticker }) => {
  if (!sticker || sticker.is_animated) {
    return;
  }

  await stickerToImage(bot, id, sticker.file_id);
});

bot.on('document', async ({ chat: { id }, document }) => {
  if (!document?.mime_type) {
    return;
  }

  const { file_id: fileId, mime_type: mimeType } = document;

  if (mimeType.startsWith('image')) {
    await imageToSticker(bot, id, fileId);
  }
});
