export interface PdfPasswordRemoverPluginOptions {
  /** Output directory relative to Vite's public base. */
  assetDirectory?: string;
}

export interface PdfPasswordRemoverVitePlugin {
  name: 'pdf-password-remover';
  enforce: 'pre';
  configResolved(config: { base: string }): void;
  configureServer(server: {
    middlewares: {
      use(handler: (
        request: { method?: string; url?: string },
        response: {
          statusCode: number;
          setHeader(name: string, value: string | number): void;
          end(body?: Uint8Array): void;
        },
        next: (error?: unknown) => void,
      ) => void): void;
    };
  }): void;
  generateBundle(this: {
    emitFile(asset: {
      type: 'asset';
      fileName: string;
      source: Uint8Array;
    }): void;
  }): Promise<void>;
}

export declare function pdfPasswordRemoverPlugin(
  options?: PdfPasswordRemoverPluginOptions,
): PdfPasswordRemoverVitePlugin;
