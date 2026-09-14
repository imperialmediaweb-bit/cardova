import QRCode from 'qrcode';

/** Public URL encoded in the QR code. `src=qr` lets analytics tell scans apart from direct visits. */
export function qrTargetUrl(username: string): string {
  return `https://cardova.net/${username}?src=qr`;
}

export async function generateQR(username: string): Promise<Buffer> {
  const buffer = await QRCode.toBuffer(qrTargetUrl(username), {
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
