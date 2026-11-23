# API reference

## `decryptPdf(input, password, options?)`

Decrypts a PDF locally in a disposable browser worker.

```ts
function decryptPdf(
  input: Blob | ArrayBuffer | ArrayBufferView,
  password: string,
  options?: {
    timeout?: number;
    maxFileSize?: number;
    workerUrl?: string | URL;
  },
): Promise<Uint8Array>;
```

The input is copied before being transferred, so the caller's original buffer is not detached. The result contains a complete unencrypted PDF.

Defaults:

- `timeout`: `60000`
- `maxFileSize`: `104857600` (100 MiB)

## `isPdfDecryptSupported()`

Returns `true` when the current environment exposes the browser primitives required by the package. It does not download or initialize WASM.

## `PdfDecryptError`

All expected failures reject with `PdfDecryptError`, whose `code` is stable across releases.

| Code | Meaning |
| --- | --- |
| `WRONG_PASSWORD` | The supplied password cannot open the PDF. |
| `INVALID_PDF` | The input is corrupt, unsupported, or not a PDF. |
| `INVALID_ARGUMENT` | The input or password has an invalid type or value. |
| `FILE_TOO_LARGE` | Input exceeds `maxFileSize`. |
| `TIMEOUT` | Processing exceeded `timeout`; the worker was terminated. |
| `UNSUPPORTED_BROWSER` | A required browser API is unavailable. |
| `WASM_FAILURE` | Worker or WASM initialization failed. |
| `PROCESSING_FAILED` | An otherwise unclassified decryption failure occurred. |
