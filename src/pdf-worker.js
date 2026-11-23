// Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
import createPdfDecrypt from './pdf-decrypt.js';

let modulePromise;

function getModule() {
  modulePromise ??= createPdfDecrypt({
    locateFile: (name) => new URL(name, import.meta.url).href,
  });
  return modulePromise;
}

self.onmessage = async ({ data }) => {
  const { pdfBuffer, password } = data;
  const input = new Uint8Array(pdfBuffer);
  const passwordBytes = new TextEncoder().encode(`${password}\0`);
  let module;
  let inputPtr;
  let passwordPtr;

  try {
    module = await getModule();
    inputPtr = module._malloc(input.byteLength);
    passwordPtr = module._malloc(passwordBytes.byteLength);
    module.HEAPU8.set(input, inputPtr);
    module.HEAPU8.set(passwordBytes, passwordPtr);

    const status = module._decrypt_pdf(
      inputPtr,
      input.byteLength,
      passwordPtr,
    );

    if (status !== 0) {
      const code = module.UTF8ToString(module._decrypt_error_code());
      self.postMessage({ ok: false, code });
      return;
    }

    const outputPtr = module._decrypt_result_data();
    const outputSize = module._decrypt_result_size();
    const output = module.HEAPU8.slice(outputPtr, outputPtr + outputSize);

    self.postMessage(
      { ok: true, pdfBuffer: output.buffer },
      [output.buffer],
    );
  } catch (error) {
    self.postMessage({
      ok: false,
      code: 'WASM_FAILURE',
      detail: error instanceof Error ? error.message : String(error),
    });
  } finally {
    input.fill(0);
    passwordBytes.fill(0);
    module?._decrypt_result_free();
    if (inputPtr) module._free(inputPtr);
    if (passwordPtr) module._free(passwordPtr);
  }
};
