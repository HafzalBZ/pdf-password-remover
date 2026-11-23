# Integration and deployment

## Vite

Use the package-owned plugin so Vite serves and emits all version-matched
runtime assets:

```js
import { defineConfig } from 'vite';
import { pdfPasswordRemoverPlugin } from 'pdf-password-remover/vite';

export default defineConfig({
  plugins: [pdfPasswordRemoverPlugin()],
});
```

```js
import { decryptPdf } from 'pdf-password-remover';

const bytes = await decryptPdf(file, password, {
  workerUrl: `${import.meta.env.BASE_URL}vendor/pdf-password-remover/pdf-worker.js`,
});
```

The plugin respects Vite's base path. Set `assetDirectory` on the plugin and
use the same directory in `workerUrl` if the default conflicts with the host
application.

## Webpack, Rollup, Parcel, and static sites

Copy the package runtime assets into the host application's public/static
directory during its build:

```sh
npx pdf-password-remover copy-assets public/vendor/pdf-password-remover
```

Then pass the deployed worker URL through `workerUrl`. The worker loads the
adjacent JavaScript bridge and WASM, so keep all three files together.

The CLI deliberately does not run during `postinstall`; it only writes files
when the consuming project explicitly invokes it.

## Required response headers

Serve `pdf-decrypt.wasm` with:

```http
Content-Type: application/wasm
```

The package falls back from streaming compilation, but the correct MIME type is faster and avoids misleading console warnings.

## Content Security Policy

A typical policy needs:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'; object-src 'none'
```

Adjust this to the host application. Do not use broad `unsafe-eval` when the narrower `wasm-unsafe-eval` is sufficient.

## Troubleshooting

- `UNSUPPORTED_BROWSER`: confirm WebAssembly and module-worker support.
- Worker fails to load: verify that `pdf-worker.js`, `pdf-decrypt.js`, and `pdf-decrypt.wasm` were emitted.
- WASM MIME warning: configure the web server for `application/wasm`.
- CSP violation: allow the same-origin worker, WASM fetch, and WASM compilation.
- Works in development but not production: inspect whether an SPA fallback returned HTML for a worker or WASM URL.
- Do not open examples with `file://`; use an HTTP development server.
