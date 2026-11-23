// Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
const form = document.querySelector('form');
const fileInput = document.querySelector('#pdf');
const passwordInput = document.querySelector('#password');
const status = document.querySelector('#status');
const submit = document.querySelector('button');
const maxFileSize = 100 * 1024 * 1024;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = fileInput.files?.[0];

  if (!file) return;

  if (typeof Worker !== 'function' || typeof WebAssembly !== 'object') {
    status.textContent = 'This browser does not support the required WebAssembly worker features.';
    return;
  }

  if (file.size > maxFileSize) {
    status.textContent = 'Please choose a PDF smaller than 100 MiB.';
    return;
  }

  submit.disabled = true;
  status.textContent = 'Decrypting locally…';

  const worker = new Worker('./pdf-worker.js', { type: 'module' });
  const timeout = setTimeout(() => {
    worker.terminate();
    status.textContent = 'Timed out.';
    submit.disabled = false;
  }, 60_000);

  worker.onmessage = ({ data }) => {
    clearTimeout(timeout);
    worker.terminate();
    passwordInput.value = '';
    submit.disabled = false;

    if (!data.ok) {
      status.textContent = data.code === 'WRONG_PASSWORD'
        ? 'Incorrect password.'
        : `Unable to decrypt PDF (${data.code}).`;
      return;
    }

    const blob = new Blob([data.pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.replace(/\.pdf$/i, '') + '-decrypted.pdf';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
    status.textContent = 'Decrypted PDF downloaded.';
  };

  worker.onerror = () => {
    clearTimeout(timeout);
    worker.terminate();
    passwordInput.value = '';
    submit.disabled = false;
    status.textContent = 'Worker failed. Check the browser console.';
  };

  try {
    const pdfBuffer = await file.arrayBuffer();
    worker.postMessage(
      { pdfBuffer, password: passwordInput.value },
      [pdfBuffer],
    );
  } catch {
    clearTimeout(timeout);
    worker.terminate();
    passwordInput.value = '';
    submit.disabled = false;
    status.textContent = 'Unable to read the selected PDF.';
  }
});
