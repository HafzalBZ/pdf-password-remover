// Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
export const PdfDecryptErrorCode = Object.freeze({
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  INVALID_PDF: 'INVALID_PDF',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  TIMEOUT: 'TIMEOUT',
  UNSUPPORTED_BROWSER: 'UNSUPPORTED_BROWSER',
  WASM_FAILURE: 'WASM_FAILURE',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
});

const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

const messages = {
  WRONG_PASSWORD: 'The PDF password is incorrect.',
  INVALID_PDF: 'The file is not a valid or supported PDF.',
  INVALID_ARGUMENT: 'The PDF input or password is invalid.',
  FILE_TOO_LARGE: 'The PDF exceeds the configured file-size limit.',
  TIMEOUT: 'PDF decryption timed out.',
  UNSUPPORTED_BROWSER: 'This browser does not support the required Web APIs.',
  WASM_FAILURE: 'The PDF decryption engine failed to load or execute.',
  PROCESSING_FAILED: 'The PDF could not be decrypted.',
};

export class PdfDecryptError extends Error {
  constructor(code, message = messages[code] ?? messages.PROCESSING_FAILED, options) {
    super(message, options);
    this.name = 'PdfDecryptError';
    this.code = code;
  }
}

export function isPdfDecryptSupported() {
  return (
    typeof Worker === 'function' &&
    typeof WebAssembly === 'object' &&
    typeof TextEncoder === 'function' &&
    typeof Blob === 'function' &&
    typeof URL === 'function'
  );
}

async function toArrayBuffer(input) {
  if (input instanceof ArrayBuffer) {
    return input.slice(0);
  }

  if (ArrayBuffer.isView(input)) {
    return input.buffer.slice(
      input.byteOffset,
      input.byteOffset + input.byteLength,
    );
  }

  if (typeof Blob === 'function' && input instanceof Blob) {
    return input.arrayBuffer();
  }

  throw new PdfDecryptError(PdfDecryptErrorCode.INVALID_ARGUMENT);
}

export async function decryptPdf(input, password, options = {}) {
  if (!isPdfDecryptSupported()) {
    throw new PdfDecryptError(PdfDecryptErrorCode.UNSUPPORTED_BROWSER);
  }

  if (typeof password !== 'string') {
    throw new PdfDecryptError(PdfDecryptErrorCode.INVALID_ARGUMENT);
  }

  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
  const pdfBuffer = await toArrayBuffer(input);

  if (pdfBuffer.byteLength === 0) {
    throw new PdfDecryptError(PdfDecryptErrorCode.INVALID_ARGUMENT);
  }

  if (pdfBuffer.byteLength > maxFileSize) {
    throw new PdfDecryptError(PdfDecryptErrorCode.FILE_TOO_LARGE);
  }

  const workerUrl = options.workerUrl ?? new URL('./pdf-worker.js', import.meta.url);
  const worker = new Worker(workerUrl, { type: 'module' });

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      callback();
    };

    const timer = setTimeout(() => {
      finish(() => reject(new PdfDecryptError(PdfDecryptErrorCode.TIMEOUT)));
    }, timeout);

    worker.onmessage = ({ data }) => {
      if (data.ok) {
        finish(() => resolve(new Uint8Array(data.pdfBuffer)));
        return;
      }

      const code = Object.prototype.hasOwnProperty.call(PdfDecryptErrorCode, data.code)
        ? data.code
        : PdfDecryptErrorCode.PROCESSING_FAILED;

      const cause = data.detail ? new Error(data.detail) : undefined;
      finish(() => reject(new PdfDecryptError(code, undefined, { cause })));
    };

    worker.onerror = (event) => {
      finish(() => reject(new PdfDecryptError(
        PdfDecryptErrorCode.WASM_FAILURE,
        undefined,
        { cause: event.error },
      )));
    };

    worker.postMessage({ pdfBuffer, password }, [pdfBuffer]);
  });
}
