import sharp from 'sharp';

export const imageToSticker = async (fileBuffer: Buffer) =>
  sharp(fileBuffer)
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

export const stickerToImage = async (fileBuffer: Buffer) =>
  sharp(fileBuffer).png().toBuffer();
