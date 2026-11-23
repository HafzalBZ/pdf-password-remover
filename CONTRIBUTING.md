# Contributing

Contributions are welcome through issues and pull requests at https://github.com/HafzalBZ/pdf-password-remover.

## Development principles

- Keep the package browser-only and focused on password-based PDF decryption.
- Do not add telemetry, analytics, external PDF services, runtime CDNs, or password persistence.
- Preserve the stable public error codes and TypeScript declarations.
- Keep generated artifacts reviewable and reproducible from the checked-in source.
- Preserve all upstream license and notice files.

## Build

Docker is the only required native build dependency.

```sh
npm run build
npm run check
npm pack --dry-run
```

`npm run build` compiles the native dependencies and adapter to WebAssembly, then refreshes every file under `dist/`. Commit source and generated output together so reviewers can see when an artifact changed.

## Testing changes

Test at least:

- correct and incorrect passwords;
- empty password handling;
- corrupt and non-PDF input;
- RC4, AES-128, and AES-256 encrypted PDFs;
- timeout and file-size limits;
- Chromium, Firefox, and WebKit;
- successful download or upload of the returned `Uint8Array`.

Do not commit real confidential PDFs or passwords. Test fixtures must contain synthetic data.

## Pull requests

Explain the reason for the change, security implications, tested browsers, tested encryption variants, and whether generated WASM hashes changed. Public API changes must also update `README.md`, `docs/API.md`, `llms.txt`, `llms-full.txt`, and `src/index.d.ts`.
