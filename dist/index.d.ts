export type PdfInput = Blob | ArrayBuffer | ArrayBufferView;

export type PdfDecryptErrorCodeValue =
  | 'WRONG_PASSWORD'
  | 'INVALID_PDF'
  | 'INVALID_ARGUMENT'
  | 'FILE_TOO_LARGE'
  | 'TIMEOUT'
  | 'UNSUPPORTED_BROWSER'
  | 'WASM_FAILURE'
  | 'PROCESSING_FAILED';

export declare const PdfDecryptErrorCode: Readonly<
  Record<PdfDecryptErrorCodeValue, PdfDecryptErrorCodeValue>
>;

export declare class PdfDecryptError extends Error {
  readonly code: PdfDecryptErrorCodeValue;
  constructor(
    code: PdfDecryptErrorCodeValue,
    message?: string,
    options?: ErrorOptions,
  );
}

export interface DecryptPdfOptions {
  /** Maximum processing time in milliseconds. Default: 60000. */
  timeout?: number;
  /** Maximum accepted input size in bytes. Default: 100 MiB. */
  maxFileSize?: number;
  /** Override the module-worker URL for unusual bundler configurations. */
  workerUrl?: string | URL;
}

export declare function isPdfDecryptSupported(): boolean;

export declare function decryptPdf(
  input: PdfInput,
  password: string,
  options?: DecryptPdfOptions,
): Promise<Uint8Array>;
