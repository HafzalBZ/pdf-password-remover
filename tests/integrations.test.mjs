// Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import test from 'node:test';

import {
  copyPdfPasswordRemoverAssets,
  pdfPasswordRemoverAssetNames,
} from '../dist/node.js';
import { pdfPasswordRemoverPlugin } from '../dist/vite.js';

const packageRoot = new URL('../', import.meta.url);

test('copy helper writes every runtime asset', async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), 'pdf-password-remover-'));
  await copyPdfPasswordRemoverAssets(outputDirectory);

  for (const assetName of pdfPasswordRemoverAssetNames) {
    const [actual, expected] = await Promise.all([
      readFile(join(outputDirectory, assetName)),
      readFile(new URL(`dist/${assetName}`, packageRoot)),
    ]);
    assert.deepEqual(actual, expected);
  }
});

test('Vite plugin emits every runtime asset', async () => {
  const emitted = [];
  const plugin = pdfPasswordRemoverPlugin();

  await plugin.generateBundle.call({
    emitFile(asset) {
      emitted.push(asset);
    },
  });

  assert.deepEqual(
    emitted.map(({ fileName }) => fileName).sort(),
    pdfPasswordRemoverAssetNames
      .map((name) => `vendor/pdf-password-remover/${name}`)
      .sort(),
  );
  assert.ok(emitted.every(({ source }) => source.byteLength > 0));
});

test('Vite development middleware serves WASM with the correct content type', async () => {
  const plugin = pdfPasswordRemoverPlugin();
  let middleware;

  plugin.configResolved({ base: '/application/' });
  plugin.configureServer({
    middlewares: {
      use(handler) {
        middleware = handler;
      },
    },
  });

  const headers = new Map();
  let statusCode;
  let body;
  await middleware(
    {
      method: 'GET',
      url: '/application/vendor/pdf-password-remover/pdf-decrypt.wasm',
    },
    {
      set statusCode(value) {
        statusCode = value;
      },
      setHeader(name, value) {
        headers.set(name.toLowerCase(), value);
      },
      end(value) {
        body = value;
      },
    },
    (error) => {
      if (error) throw error;
      assert.fail('Expected the PDF asset middleware to handle the request.');
    },
  );

  assert.equal(statusCode, 200);
  assert.equal(headers.get('content-type'), 'application/wasm');
  assert.ok(body.byteLength > 0);
});

test('Vite plugin rejects unsafe output directories', () => {
  assert.throws(
    () => pdfPasswordRemoverPlugin({ assetDirectory: '../outside' }),
    /relative directory/,
  );
});
