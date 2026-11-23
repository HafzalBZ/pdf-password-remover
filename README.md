# PDF Password Remover

Decrypt password-protected PDFs locally in the browser using QPDF compiled to WebAssembly. The PDF and password are processed in a disposable Web Worker and are not uploaded.

Created and maintained by [HafzalBZ](https://github.com/HafzalBZ). Source, generated WebAssembly artifacts, and reproducible build instructions are published at [github.com/HafzalBZ/pdf-password-remover](https://github.com/HafzalBZ/pdf-password-remover).

Use the hosted browser tool at [hafzalbz.github.io/pdf-password-remover](https://hafzalbz.github.io/pdf-password-remover/). The selected PDF and password remain in your browser.

## Install

```sh
npm install pdf-password-remover
```

```js
import { decryptPdf, PdfDecryptError } from 'pdf-password-remover';

try {
  const bytes = await decryptPdf(file, password);
  const decrypted = new Blob([bytes], { type: 'application/pdf' });
} catch (error) {
  if (error instanceof PdfDecryptError && error.code === 'WRONG_PASSWORD') {
    // Ask for the password again.
  }
}
```

Accepted inputs are `File`, `Blob`, `ArrayBuffer`, and typed-array views. The result is a `Uint8Array` containing an unencrypted PDF.

This package does not crack or recover unknown passwords. Only use it for documents you own or are authorized to decrypt.

## Build from source

Requirements: Docker and network access for the first build.

```sh
npm run build
```

The Docker build compiles QPDF, zlib and libjpeg-turbo, then creates the JavaScript, worker, type declaration, and WASM files under `dist/`.

The repository intentionally includes both buildable source and generated `dist/` artifacts so users can inspect the implementation, rebuild it independently, or consume a reviewed release without installing a compiler toolchain.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing the native build, public API, or generated artifacts.

Official source archives and the Emscripten image are pinned by SHA-256. The
build stops before compilation if any source hash does not match.

## Run the development demo

```sh
./serve.sh
```

Open <http://localhost:8080>, choose a password-protected PDF, enter its
password, and download the decrypted result.

## Browser and server requirements

- WebAssembly and module-worker support
- HTTP or HTTPS; module workers do not run reliably from `file://`
- `application/wasm` content type for the WASM asset
- CSP permissions for the same-origin worker and WASM compilation

No `SharedArrayBuffer`, WebAssembly threads, COOP, or COEP is required.

## API and integration documentation

- [API reference](docs/API.md)
- [Integration guide](docs/INTEGRATION.md)
- [Security model](docs/SECURITY.md)
- [LLM quick context](llms.txt)
- [LLM complete context](llms-full.txt)

## Scope

- One operation: decrypt an in-memory PDF with a supplied password.
- QPDF runs inside a disposable browser Web Worker.
- No virtual filesystem and no QPDF command-line interface.
- The worker is terminated after every attempt.
- This does not crack or recover unknown passwords.

## Licenses

QPDF is Apache-2.0. zlib and libjpeg-turbo have permissive licenses. Preserve
their license and notice files when distributing the generated WebAssembly.
