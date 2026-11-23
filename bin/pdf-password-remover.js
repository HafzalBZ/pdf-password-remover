#!/usr/bin/env node
// Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
import process from 'node:process';

import { copyPdfPasswordRemoverAssets } from '../dist/node.js';

const [, , command, outputDirectory, ...extraArguments] = process.argv;

if (
  command !== 'copy-assets' ||
  !outputDirectory ||
  extraArguments.length > 0
) {
  console.error(
    'Usage: pdf-password-remover copy-assets <output-directory>',
  );
  process.exitCode = 1;
} else {
  try {
    await copyPdfPasswordRemoverAssets(outputDirectory);
    console.log(`Copied PDF password remover assets to ${outputDirectory}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
