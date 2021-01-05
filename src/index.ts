import type { PhotoSize } from 'node-telegram-bot-api';

import { bot, botUsername, downloadFile } from './utils';
import { emojiToSticker, imageToSticker, stickerToImage } from './image';
import { audioToVoice, voiceToAudio } from './audio';
import { animationToVideo, videoToNote } from './video';

bot.onText(
  new RegExp(`^\\/start(?:@${botUsername})?\s*$`),
  async ({ chat: { id } }) => {
    await bot.sendChatAction(id, 'typing');
    await bot.sendMessage(
      id,
      `Hi\\!
This bot allows you to easily convert a Telegram media to a different one\\.

More specifically, it allows you to convert:
• *Pictures* to *stickers* and viceversa
• *Audios* to *voice notes* and viceversa
• *Videos* to *video notes* and viceversa
• *GIFs* to *videos*
• *Emojis* to *stickers* \\(experimental\\)

_Note that you can also send pictures, audios, and videos as files\\. The bot will do its best to convert them properly\\._
`,
      {
        parse_mode: 'MarkdownV2',
      },
    );
  },
);

bot.onText(
  // This regex matches a combination of:
  // - Extended pictographics (i.e. all the pictographic emojis without the character based ones)
  // - Zero Width Joiner (u200d)
  // - Regional indicator symbols (u1f1e6 to u1f1ff)
  // - Skin modifiers (u1f3fb to u1f3ff)
  /^[\p{Extended_Pictographic}\u{200d}\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}]+$/u,
  async ({ chat: { id }, text = '' }) => {
    await emojiToSticker(bot, id, text);
  },
);

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
