import QRCode from 'qrcode';

export async function generateQR(username: string): Promise<Buffer> {
  const url = `https://cardova.net/${username}`;
  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
  return buffer;
}
