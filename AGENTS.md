# Contributor instructions

This is an independent personal open-source project. Do not add company names, company scopes, company repository URLs, analytics, telemetry, external PDF services, or runtime CDN dependencies.

The project owner and package author is HafzalBZ (https://github.com/HafzalBZ). The canonical repository is https://github.com/HafzalBZ/pdf-password-remover.

The package has one responsibility: accept PDF bytes and a user-supplied password in a browser, then return an unencrypted PDF. Keep QPDF behind the stable JavaScript API in `src/index.js`.

When changing native dependencies or build flags:

1. Pin immutable sources and verify their hashes/signatures.
2. Preserve all required third-party licenses.
3. Rebuild with `npm run build`.
4. Test correct password, wrong password, corrupt PDF, RC4, AES-128, AES-256, timeout, and file-size limits.
5. Test Chromium, Firefox, and WebKit browsers.
6. Update `llms.txt`, `llms-full.txt`, API docs, TypeScript declarations, and the changelog if the public contract changes.

Never log, persist, or transmit PDF passwords.
