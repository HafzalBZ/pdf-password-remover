// Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const pdfPasswordRemoverAssetNames = Object.freeze([
  'pdf-worker.js',
  'pdf-decrypt.js',
  'pdf-decrypt.wasm',
]);

export async function copyPdfPasswordRemoverAssets(outputDirectory) {
  if (
    typeof outputDirectory !== 'string' &&
    !(outputDirectory instanceof URL)
  ) {
    throw new TypeError('outputDirectory must be a path string or file URL.');
  }

  await mkdir(outputDirectory, { recursive: true });

  await Promise.all(pdfPasswordRemoverAssetNames.map((assetName) => copyFile(
    new URL(`./${assetName}`, import.meta.url),
    new URL(`./${assetName}`, toDirectoryUrl(outputDirectory)),
  )));
}

function toDirectoryUrl(directory) {
  if (directory instanceof URL) {
    return new URL(directory.href.endsWith('/') ? directory.href : `${directory.href}/`);
  }

  const resolved = pathToFileURL(resolve(directory));
  return new URL(resolved.href.endsWith('/') ? resolved.href : `${resolved.href}/`);
}
