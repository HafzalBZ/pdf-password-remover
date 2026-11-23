import {
  decryptPdf,
  PdfDecryptError,
} from 'pdf-decrypt-wasm';

export async function decryptAndDownload(file, password) {
  try {
    const bytes = await decryptPdf(file, password);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = file.name.replace(/\.pdf$/i, '') + '-decrypted.pdf';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  } catch (error) {
    if (error instanceof PdfDecryptError && error.code === 'WRONG_PASSWORD') {
      throw new Error('Please check the PDF password.');
    }

    throw error;
  }
}
