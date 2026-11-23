# Integration and deployment

## Bundlers

Import from the package root. Do not import generated Emscripten files directly.

```js
import { decryptPdf } from 'pdf-decrypt-wasm';
```

The package resolves the adjacent module worker and WASM using `import.meta.url`. Modern Vite, Webpack, Rollup and Parcel builds should emit both assets automatically. If an asset pipeline relocates workers, pass its final URL through `workerUrl`.

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
