export declare const pdfPasswordRemoverAssetNames: readonly [
  'pdf-worker.js',
  'pdf-decrypt.js',
  'pdf-decrypt.wasm',
];

export declare function copyPdfPasswordRemoverAssets(
  outputDirectory: string | URL,
): Promise<void>;
