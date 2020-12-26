import { bot, downloadFile } from './utils';
import { imageToSticker, stickerToImage } from './image';

import type { PhotoSize } from 'node-telegram-bot-api';

bot.on('photo', async ({ chat: { id }, photo = [] }) => {
  const { file_id: largestFileId } = photo.reduce<PhotoSize>(
    (largestFile, file = { file_id: '', width: 0, height: 0 }) =>
      file.width > largestFile.width ? file : largestFile,
    { file_id: '', width: 0, height: 0 },
  );

  const fileBuffer = await downloadFile(largestFileId);

  const transformedFileBuffer = await imageToSticker(fileBuffer);

  await bot.sendSticker(id, transformedFileBuffer);
});

bot.on('sticker', async ({ chat: { id }, sticker }) => {
  if (sticker?.is_animated) {
    return;
  }

  const fileId = sticker?.file_id || '';

  const fileBuffer = await downloadFile(fileId);

  const transformedFileBuffer = await stickerToImage(fileBuffer);

  await bot.sendDocument(id, transformedFileBuffer);
});

bot.on('document', async ({ chat: { id }, document }) => {
  if (!document?.file_name) {
    return;
  }

  const { file_id: fileId, file_name: fileName } = document;

  if (/\.(jpeg|jpg|png|webp|avif|tiff|tif|gif|svg)$/i.test(fileName)) {
    const fileBuffer = await downloadFile(fileId);

    const transformedFileBuffer = await imageToSticker(fileBuffer);

    await bot.sendSticker(id, transformedFileBuffer);
  }
});
