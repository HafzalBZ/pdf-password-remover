// Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
import { readFile } from 'node:fs/promises';

import { pdfPasswordRemoverAssetNames } from './node.js';

const contentTypes = Object.freeze({
  '.js': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
});

export function pdfPasswordRemoverPlugin(options = {}) {
  const assetDirectory = normalizeAssetDirectory(
    options.assetDirectory ?? 'vendor/pdf-password-remover',
  );
  let base = '/';

  return {
    name: 'pdf-password-remover',
    enforce: 'pre',

    configResolved(config) {
      base = normalizeBase(config.base);
    },

    configureServer(server) {
      const requestPrefix = `${base}${assetDirectory}/`;

      server.middlewares.use(async (request, response, next) => {
        try {
          const pathname = new URL(
            request.url ?? '/',
            'http://pdf-password-remover.local',
          ).pathname;

          if (!pathname.startsWith(requestPrefix)) {
            next();
            return;
          }

          const assetName = pathname.slice(requestPrefix.length);
          if (!pdfPasswordRemoverAssetNames.includes(assetName)) {
            next();
            return;
          }

          const source = await readPackageAsset(assetName);
          response.statusCode = 200;
          response.setHeader('Content-Type', contentTypeFor(assetName));
          response.setHeader('Content-Length', source.byteLength);
          response.setHeader('Cache-Control', 'no-cache');

          if (request.method === 'HEAD') {
            response.end();
            return;
          }

          response.end(source);
        } catch (error) {
          next(error);
        }
      });
    },

    async generateBundle() {
      await Promise.all(pdfPasswordRemoverAssetNames.map(async (assetName) => {
        this.emitFile({
          type: 'asset',
          fileName: `${assetDirectory}/${assetName}`,
          source: await readPackageAsset(assetName),
        });
      }));
    },
  };
}

function normalizeAssetDirectory(value) {
  if (typeof value !== 'string') {
    throw new TypeError('assetDirectory must be a string.');
  }

  const normalized = value.replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
  const segments = normalized.split('/');

  if (
    normalized.length === 0 ||
    segments.some((segment) => segment === '.' || segment === '..' || segment === '')
  ) {
    throw new TypeError('assetDirectory must be a non-empty relative directory.');
  }

  return normalized;
}

function normalizeBase(value) {
  const base = typeof value === 'string' && value.length > 0 ? value : '/';
  return `${base.startsWith('/') ? '' : '/'}${base.replace(/\/*$/, '/')}`;
}

function contentTypeFor(assetName) {
  const extension = assetName.endsWith('.wasm') ? '.wasm' : '.js';
  return contentTypes[extension];
}

function readPackageAsset(assetName) {
  return readFile(new URL(`./${assetName}`, import.meta.url));
}
