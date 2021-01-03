import type { PhotoSize } from 'node-telegram-bot-api';

import { bot, downloadFile } from './utils';
import { imageToSticker, stickerToImage } from './image';
import { audioToVoice, voiceToAudio } from './audio';
import { animationToVideo, videoToNote } from './video';

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

bot.on('audio', async ({ chat: { id }, audio }) => {
  if (!audio) {
    return;
  }

  await audioToVoice(bot, id, audio.file_id);
});

bot.on('voice', async ({ chat: { id }, voice }) => {
  if (!voice) {
    return;
  }

  await voiceToAudio(bot, id, voice.file_id);
});

bot.on('video', async ({ chat: { id }, video }) => {
  if (!video) {
    return;
  }

  await videoToNote(bot, id, video.file_id);
});

bot.on('animation', async ({ chat: { id }, animation }) => {
  if (animation?.mime_type !== 'video/mp4') {
    return;
  }

  await animationToVideo(bot, id, animation.file_id);
});

bot.on('video_note', async ({ chat: { id }, video_note }) => {
  if (!video_note) {
    return;
  }

  const fileBuffer = await downloadFile(video_note.file_id);

  await bot.sendVideo(id, fileBuffer);
});

bot.on('document', async ({ chat: { id }, document }) => {
  if (!document?.mime_type) {
    return;
  }

  const { file_id: fileId, mime_type: mimeType } = document;

  if (mimeType.startsWith('image')) {
    await imageToSticker(bot, id, fileId);
  }

  if (mimeType.startsWith('audio')) {
    await audioToVoice(bot, id, fileId);
  }

  if (mimeType.startsWith('video')) {
    await videoToNote(bot, id, fileId);
  }
});
