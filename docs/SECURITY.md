# Security and privacy

The PDF and password are processed locally inside a disposable module Web Worker. The package does not intentionally transmit either value.

Security properties:

- No runtime dependencies or remote API calls.
- No virtual filesystem in the WASM build.
- Native QPDF crypto provider; no OpenSSL or GnuTLS.
- Configurable file-size and execution-time limits.
- Worker termination after every operation.
- Temporary byte arrays are zeroed when JavaScript provides access to them.

Limitations:

- JavaScript strings cannot be securely erased.
- A malicious PDF may consume substantial CPU or memory before the configured timeout.
- The package validates a supplied password; it does not determine whether the user is authorized to remove encryption.
- Host applications must not log or persist passwords.

For published releases, verify npm provenance and the SHA-256 manifest. Build inputs should be immutable and hash-verified.
